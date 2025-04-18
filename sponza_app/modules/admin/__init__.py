from flask import (
    current_app,
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    jsonify,
)
from sponza_app.models import Admin, Campaign, CampaignInfluencer, Influencer, Sponsor
from sponza_app import db, bcrypt
from flask_login import current_user, login_required
from sponza_app.modules.admin.utils import (
    return_sponsor_profile_image,
    return_inf_profile_image,
    return_campaign_image,
    send_flag_mail,
    send_camp_flag_mail,
)

from datetime import date

admin = Blueprint("admin", __name__)


@admin.route("/add-admin", methods=["POST", "GET"])
@login_required
def add_admin():
    if isinstance(current_user, Admin):
        existing_user = Admin.query.filter_by(
            email=request.form.get("email").strip()
        ).first()
        if existing_user is None:
            hashed_password = bcrypt.generate_password_hash(
                request.form.get("password").strip()
            ).decode("utf-8")
            admin = Admin(
                email=request.form.get("email").strip(),
                password=hashed_password,
            )
            db.session.add(admin)
            db.session.commit()
            flash(f"Admin added successfully", "success")
        else:
            flash(
                f"Admin already exists, Please use a different email.",
                "error",
            )
        return redirect(url_for("admin.admin_dashboard"))
    return redirect(url_for("main.home"))


@admin.route("/dashboard")
@login_required
def admin_dashboard():
    if isinstance(current_user, Admin):
        campaigns = Campaign.query.filter_by(admin_flag="True").all()
        influencers = Influencer.query.filter_by(admin_flag="True").all()
        sponsors = Sponsor.query.filter_by(admin_flag="True").all()
        for spn in sponsors:
            spn.sponsor_profile_image = return_sponsor_profile_image(
                spn.sponsor_profile_image
            )
            spn.campaign_titles = [camp.campaign_title for camp in spn.campaigns]

        # Process influencers
        for inf in influencers:
            inf.influencer_profile_image = return_inf_profile_image(
                inf.influencer_profile_image
            )
            # Add campaign titles for each influencer
            inf.campaign_titles = [
                camp.campaign_title
                for camp in Campaign.query.join(CampaignInfluencer)
                .filter(
                    CampaignInfluencer.influencer_id == inf.influencer_id,
                    CampaignInfluencer.status == "accepted",
                )
                .all()
            ]

        # Process campaigns
        for camp in campaigns:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )
            print(camp.campaign_end_date)
            camp.sponsor_name = Sponsor.query.get(camp.sponsor_id).sponsor_company_name
            camp.total_camp_days = (
                camp.campaign_end_date - camp.campaign_start_date
            ).days
            camp.completed_camp_days = (date.today() - camp.campaign_start_date).days
            camp.progress = (
                int((camp.completed_camp_days / camp.total_camp_days) * 100)
                if camp.total_camp_days > 0
                else 0
            )

            accepted_influencers = CampaignInfluencer.query.filter_by(
                campaign_id=camp.campaign_id, status="accepted"
            ).all()

            camp.all_influencers = [
                inf.influencer.influencer_user_name for inf in accepted_influencers
            ]
        return render_template(
            "admin/admin_dashboard.html",
            title="Admin - Dashboard",
            campaigns=campaigns,
            influencers=influencers,
            sponsors=sponsors,
        )
    return redirect(url_for("main.home"))


@admin.route("/find")
@login_required
def admin_find():
    if isinstance(current_user, Admin):
        campaigns = Campaign.query.filter_by(admin_flag="False").all()
        influencers = Influencer.query.filter_by(admin_flag="False").all()
        sponsors = Sponsor.query.filter_by(admin_flag="False").all()

        # Process sponsors
        for spn in sponsors:
            spn.sponsor_profile_image = return_sponsor_profile_image(
                spn.sponsor_profile_image
            )
            spn.campaign_titles = [camp.campaign_title for camp in spn.campaigns]

        # Process influencers
        for inf in influencers:
            inf.influencer_profile_image = return_inf_profile_image(
                inf.influencer_profile_image
            )
            # Add campaign titles for each influencer
            inf.campaign_titles = [
                camp.campaign_title
                for camp in Campaign.query.join(CampaignInfluencer)
                .filter(
                    CampaignInfluencer.influencer_id == inf.influencer_id,
                    CampaignInfluencer.status == "accepted",
                )
                .all()
            ]

        # Process campaigns
        for camp in campaigns:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )
            camp.sponsor_name = Sponsor.query.get(camp.sponsor_id).sponsor_company_name
            camp.total_camp_days = (
                camp.campaign_end_date - camp.campaign_start_date
            ).days
            camp.completed_camp_days = (date.today() - camp.campaign_start_date).days
            camp.progress = (
                int((camp.completed_camp_days / camp.total_camp_days) * 100)
                if camp.total_camp_days > 0
                else 0
            )

            accepted_influencers = CampaignInfluencer.query.filter_by(
                campaign_id=camp.campaign_id, status="accepted"
            ).all()

            camp.all_influencers = [
                inf.influencer.influencer_user_name for inf in accepted_influencers
            ]

        return render_template(
            "admin/admin_find.html",
            title="Admin - Campaigns",
            campaigns=campaigns,
            influencers=influencers,
            sponsors=sponsors,
        )
    return redirect(url_for("main.home"))


@admin.route("/get-graph-data")
@login_required
def get_graph_data():
    if isinstance(current_user, Admin):
        campaigns = Campaign.query.all()
        data = {camp.campaign_title: camp.campaign_expenses for camp in campaigns}

        return jsonify(data)
    return redirect(url_for("main.home"))


@admin.route("/get-pie-data")
def get_pie_data():
    inf_count = len(Influencer.query.all())
    camp_count = len(Campaign.query.all())
    data = {"campaign": camp_count, "influencer": inf_count}
    return jsonify(data)


@admin.route("/flag", methods=["POST"])
def flag():
    if isinstance(current_user, Admin):
        data = request.json
        role = data.get("role")
        id = data.get("id")
        if role == "camp":
            camp = Campaign.query.get(id)
            camp.admin_flag = "True"
            send_camp_flag_mail(Sponsor.query.get(camp.sponsor_id), camp.campaign_title)
            camp_inf = CampaignInfluencer.query.filter(
                CampaignInfluencer.campaign_id == camp.campaign_id,
                CampaignInfluencer.status != "accepted",
            ).all()
            for camp in camp_inf:
                db.session.delete(camp)
            db.session.commit()
        elif role == "inf":
            inf = Influencer.query.get(id)
            inf.admin_flag = "True"
            send_flag_mail(inf, "Influencer")
        elif role == "spn":
            spn = Sponsor.query.get(id)
            spn.admin_flag = "True"
            send_flag_mail(spn, "Sponsor")
        else:
            return jsonify({"error": "Invaild Data! Data not Found"}), 404
        db.session.commit()
        return (
            jsonify({"message": "Flag Successful!"}),
            200,
        )
    return jsonify({"unauthorized": "You are not authorized"}), 401


@admin.route("/unflag", methods=["POST"])
def unflag():
    if isinstance(current_user, Admin):
        data = request.json
        role = data.get("role")
        id = data.get("id")
        if role == "camp":
            camp = Campaign.query.get(id)
            camp.admin_flag = "False"
        elif role == "inf":
            inf = Influencer.query.get(id)
            inf.admin_flag = "False"
        elif role == "spn":
            spn = Sponsor.query.get(id)
            spn.admin_flag = "False"
        else:
            return jsonify({"error": "Invaild Data! Data not Found"}), 404
        db.session.commit()
        return (
            jsonify({"message": "Unflag Successful!"}),
            200,
        )
    return jsonify({"unauthorized": "You are not authorized"}), 401
