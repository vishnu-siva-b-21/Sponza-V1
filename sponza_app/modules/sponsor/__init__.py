from flask import (
    current_app,
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    session,
    jsonify,
)
from sponza_app.models import Sponsor, Campaign, Influencer, CampaignInfluencer
from sponza_app import db, bcrypt
from flask_login import current_user, login_required
from sponza_app.modules.sponsor.utils import (
    del_save_image,
    return_sponsor_profile_image,
    return_inf_profile_image,
    return_campaign_image,
    save_camp_image,
    del_save_camp_image,
    del_spon_image,
    del_camp_image,
)
import os
from datetime import datetime, date


sponsor = Blueprint("sponsor", __name__)


@sponsor.route("/register", methods=["POST", "GET"])
def sponsor_register():
    if isinstance(current_user, Sponsor):
        return redirect(url_for("sponsor.sponsor_dashboard"))
    existing_user = Sponsor.query.filter_by(
        email=request.form.get("sponsor_email").strip()
    ).first()
    if existing_user is None:
        hashed_password = bcrypt.generate_password_hash(
            request.form.get("sponsor_password").strip()
        ).decode("utf-8")
        sponsor = Sponsor(
            sponsor_company_name=request.form.get("sponsor_company_name").strip(),
            email=request.form.get("sponsor_email").strip(),
            password=hashed_password,
        )
        db.session.add(sponsor)
        db.session.commit()
        flash(f"Sponsor added successfully", "success")
    else:
        flash(
            f"Sponsor already exists, Please use a different email.",
            "error",
        )
    return redirect(url_for("main.home"))


@sponsor.route("/dashboard")
@login_required
def sponsor_dashboard():
    if isinstance(current_user, Sponsor):
        image = return_sponsor_profile_image(current_user.sponsor_profile_image)

        sponsor_campaigns = current_user.campaigns

        # Retrieve all CampaignInfluencer records with status "inf_sent_pending"
        pending_requests = []
        for camp in sponsor_campaigns:
            pending_influencers = CampaignInfluencer.query.filter_by(
                campaign_id=camp.campaign_id, status="inf_sent_pending"
            ).all()
            pending_requests.extend(pending_influencers)

        for camp in sponsor_campaigns:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )
            camp.total_camp_days = (
                camp.campaign_end_date - camp.campaign_start_date
            ).days
            camp.completed_camp_days = (date.today() - camp.campaign_start_date).days
            if camp.total_camp_days > 0:
                camp.progress = int(
                    (camp.completed_camp_days / camp.total_camp_days) * 100
                )
            else:
                camp.progress = 0

        user_num_camp = len(current_user.campaigns)
        num_camp = len(Campaign.query.all())
        total_expenses = sum([camp.campaign_expenses for camp in sponsor_campaigns])

        return render_template(
            "sponsor/sponsor_dashboard.html",
            title="Sponsor - Dashboard",
            image=image,
            user_num_camp=user_num_camp,
            num_camp=num_camp,
            sponsor_name=current_user.sponsor_company_name,
            campaigns=sponsor_campaigns,
            total_expenses=total_expenses,
            num_pending_requests=len(
                pending_requests
            ),  # Pass the pending requests to the template
        )
    return redirect(url_for("main.home"))


@sponsor.route("/campaigns")
@login_required
def sponsor_campaigns():
    if isinstance(current_user, Sponsor):
        image = return_sponsor_profile_image(current_user.sponsor_profile_image)

        # Pagination setup
        page = request.args.get("page", 1, type=int)
        per_page = 4
        sponsor_campaigns = Campaign.query.filter_by(
            sponsor_id=current_user.sponsor_id
        ).paginate(page=page, per_page=per_page)

        for camp in sponsor_campaigns.items:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )

        return render_template(
            "sponsor/sponsor_campaigns.html",
            title="Sponsor - Campaigns",
            sponsor_name=current_user.sponsor_company_name,
            image=image,
            campaigns=sponsor_campaigns,
        )
    return redirect(url_for("main.home"))


@sponsor.route("/add-campaign", methods=["POST", "GET"])
@login_required
def add_campaign():
    if isinstance(current_user, Sponsor):
        if request.method == "POST":
            file_name = (
                save_camp_image(request.files["profile_pic"])
                if request.files["profile_pic"]
                else request.args.get("file")
            )
            campaign = Campaign(
                campaign_title=request.form.get("title").strip(),
                campaign_desc=request.form.get("desc"),
                campaign_end_date=datetime.strptime(
                    request.form.get("end_date"), "%Y-%m-%d"
                ).date(),
                campaign_profile_image=file_name,
                sponsor_id=current_user.sponsor_id,
            )
            print(campaign)
            db.session.add(campaign)
            db.session.commit()
        return redirect(url_for("sponsor.sponsor_campaigns"))
    return redirect(url_for("main.home"))


@sponsor.route("/profile")
@login_required
def sponsor_profile():
    if isinstance(current_user, Sponsor):
        image = return_sponsor_profile_image(current_user.sponsor_profile_image)
        return render_template(
            "sponsor/sponsor_profile.html",
            title="Sponsor - Profile",
            sponsor_name=current_user.sponsor_company_name,
            sponsor=current_user,
            image=image,
        )
    return redirect(url_for("main.home"))


@sponsor.route("/update-camp-image/<id>", methods=["POST", "GET"])
@login_required
def update_camp_image(id):
    if isinstance(current_user, Sponsor):
        if request.method == "POST":
            file_name = (
                del_save_camp_image(
                    request.files["camp_image"],
                    request.args.get("file"),
                )
                if request.files["camp_image"]
                else request.args.get("file")
            )
            campaign = Campaign.query.get(id)
            if campaign:
                campaign.campaign_profile_image = file_name
                db.session.commit()
                flash("Campaign Image updated successfully", "success")
            else:
                flash("Campaign not found", "error")
            return redirect(url_for("sponsor.sponsor_details", id=id))
        return redirect(url_for("sponsor.sponsor_details", id=id))
    return redirect(url_for("main.home"))


@sponsor.route("/update-profile", methods=["POST", "GET"])
@login_required
def update_profile():
    if isinstance(current_user, Sponsor):
        if request.method == "POST":
            file_name = (
                del_save_image(request.files["profile_pic"], request.args.get("file"))
                if request.files["profile_pic"]
                else request.args.get("file")
            )
            Sponsor.query.filter_by(email=current_user.email).update(
                dict(
                    sponsor_company_name=request.form.get("company_name").strip(),
                    email=request.form.get("email").strip(),
                    sponsor_profile_image=file_name,
                )
            )
            db.session.commit()
            flash("Profile updated successfully", "success")
            return redirect(url_for("sponsor.sponsor_profile"))
        return redirect(url_for("sponsor.sponsor_profile"))
    return redirect(url_for("main.home"))


@sponsor.route("/details/<id>")
@login_required
def sponsor_details(id):
    if isinstance(current_user, Sponsor):
        campaign = Campaign.query.get(id)
        if campaign:
            image = return_sponsor_profile_image(current_user.sponsor_profile_image)
            campaign.campaign_profile_image = return_campaign_image(
                campaign.campaign_profile_image
            )
            camp_sent_pending = []
            inf_sent_pending = []
            accpted_inf = []

            for inf in CampaignInfluencer.query.filter_by(
                campaign_id=id, status="camp_sent_pending"
            ).all():
                inf_data = {
                    "main_id": inf.ci_id,
                    "id": inf.influencer.influencer_id,
                    "email": inf.influencer.email,
                    "username": inf.influencer.influencer_user_name,
                    "image": return_inf_profile_image(
                        inf.influencer.influencer_profile_image
                    ),
                    "camp_pay": inf.campaign_amt,
                }
                camp_sent_pending.append(inf_data)

            for inf in CampaignInfluencer.query.filter_by(
                campaign_id=id, status="inf_sent_pending"
            ).all():
                inf_data = {
                    "main_id": inf.ci_id,
                    "id": inf.influencer.influencer_id,
                    "email": inf.influencer.email,
                    "niche": inf.influencer.influencer_niche,
                    "platform": inf.influencer.influencer_social_media_platform,
                    "link": inf.influencer.influencer_social_media_link,
                    "username": inf.influencer.influencer_user_name,
                    "image": return_inf_profile_image(
                        inf.influencer.influencer_profile_image
                    ),
                    "inf_pay": inf.campaign_amt,
                }
                inf_sent_pending.append(inf_data)

            for inf in CampaignInfluencer.query.filter_by(
                campaign_id=id, status="accepted"
            ).all():
                inf_data = {
                    "main_id": inf.ci_id,
                    "id": inf.influencer.influencer_id,
                    "username": inf.influencer.influencer_user_name,
                    "image": return_inf_profile_image(
                        inf.influencer.influencer_profile_image
                    ),
                    "camp_pay": inf.campaign_amt,
                }
                accpted_inf.append(inf_data)
            return render_template(
                "sponsor/sponsor_details.html",
                title="Sponsor - Profile",
                image=image,
                camp=campaign,
                camp_sent_pending=camp_sent_pending,
                inf_sent_pending=inf_sent_pending,
                accpted_inf=accpted_inf,
            )
        else:
            return redirect(url_for("sponsor.sponsor_campaigns"))
    return redirect(url_for("main.home"))


@sponsor.route("/change-details/<id>", methods=["POST"])
@login_required
def sponsor_change_details(id):
    if isinstance(current_user, Sponsor):
        campaign = Campaign.query.get(id)
        if not campaign:
            flash("Campaign not found", "error")
            return redirect(url_for("sponsor.sponsor_details", id=id))

        name = request.form.get("name")
        description = request.form.get("description")
        updated = False

        if name:
            name = name.strip()
            if name and name != campaign.campaign_title:
                campaign.campaign_title = name
                updated = True
                flash("Changed Name Successfully", "success")
            else:
                flash("No change detected for Name", "error")

        if description:
            description = description.strip()
            if description and description != campaign.campaign_desc:
                campaign.campaign_desc = description
                updated = True
                flash("Changed Description Successfully", "success")
            else:
                flash("No change detected for Description", "error")

        if updated:
            db.session.commit()
        else:
            flash("Invalid or No changes detected!", "error")

        return redirect(url_for("sponsor.sponsor_details", id=id))
    return redirect(url_for("main.home"))


@sponsor.route("/search-inf", methods=["POST", "GET"])
@login_required
def search_inf():
    data = request.get_json()
    query = data.get("query", "").lower()

    influencers = Influencer.query.filter(
        (Influencer.influencer_user_name.contains(query))
        | (Influencer.email.contains(query))
        | (Influencer.influencer_niche.contains(query))
        | (Influencer.influencer_social_media_platform.contains(query))
    ).all()

    user_list = [
        {
            "id": influencer.influencer_id,
            "email": influencer.email,
            "username": influencer.influencer_user_name,
            "image": return_inf_profile_image(influencer.influencer_profile_image),
        }
        for influencer in influencers
    ]

    return jsonify({"users": user_list})


@sponsor.route("/send-ad-request/<camp_id>", methods=["POST"])
@login_required
def send_ad_request(camp_id):
    ad_data = request.json
    inf_id = ad_data["adInfluencerid"]
    camp_pay = ad_data["adPayment"]

    campaign = Campaign.query.get(camp_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    if campaign.admin_flag == "True":
        return (
            jsonify(
                {
                    "error": "This Campaign is Flagged by admin, Please check your email for more details."
                }
            ),
            405,
        )
    influencer = Influencer.query.get(inf_id)
    if not influencer:
        return jsonify({"error": "Influencer not found"}), 404

    camp_inf = CampaignInfluencer.query.filter_by(
        campaign_id=campaign.campaign_id, influencer_id=influencer.influencer_id
    ).first()
    if camp_inf:
        if camp_inf.status == "camp_sent_pending":
            return jsonify({"error": "Ad request already sent"}), 409
        elif camp_inf.status == "inf_sent_pending":
            return jsonify({"error": "Ad request already recieved"}), 409
        elif camp_inf.status == "accepted":
            return jsonify({"error": "Ad request already accepted"}), 409
        else:
            return jsonify({"error": "Error"}), 404

    campaign_influencer = CampaignInfluencer(
        campaign_id=campaign.campaign_id,
        influencer_id=influencer.influencer_id,
        campaign_amt=camp_pay,
        status="camp_sent_pending",
    )

    db.session.add(campaign_influencer)
    db.session.commit()

    return jsonify({"message": "Ad request sent successfully"}), 200


@sponsor.route("/accept-ad-req", methods=["POST"])
def accept_ad_req():
    if isinstance(current_user, Sponsor):
        data = request.json
        inf_id = data.get("inf_id")
        camp_id = data.get("camp_id")

        campaign = Campaign.query.get(camp_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        influencer = Influencer.query.get(inf_id)
        if not influencer:
            return jsonify({"error": "Influencer not found"}), 404

        camp_inf = CampaignInfluencer.query.filter_by(
            campaign_id=campaign.campaign_id, influencer_id=influencer.influencer_id
        ).first()

        if camp_inf:
            if camp_inf.status == "accepted":
                return jsonify({"error": "Request has already been accepted"}), 400

            camp_inf.status = "accepted"

            campaign.campaign_expenses += camp_inf.campaign_amt
            influencer.influencer_income += camp_inf.campaign_amt

            db.session.commit()
            return (
                jsonify({"message": "Ad request has been accepted successfully"}),
                200,
            )
        else:
            return jsonify({"error": "Request has not been received to accept"}), 404

    return jsonify({"unauthorized": "You are not authorized"}), 401


@sponsor.route("/rm-ad-req", methods=["POST"])
def rm_ad_req():
    if isinstance(current_user, Sponsor):
        data = request.json
        inf_id = data.get("inf_id")
        camp_id = data.get("camp_id")

        campaign = Campaign.query.get(camp_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        influencer = Influencer.query.get(inf_id)
        if not influencer:
            return jsonify({"error": "Influencer not found"}), 404

        camp_inf = CampaignInfluencer.query.filter_by(
            campaign_id=campaign.campaign_id, influencer_id=influencer.influencer_id
        ).first()

        if camp_inf:
            if camp_inf.status == "accepted":

                campaign.campaign_expenses -= camp_inf.campaign_amt
                influencer.influencer_income -= camp_inf.campaign_amt

            db.session.delete(camp_inf)
            db.session.commit()
            return (
                jsonify({"message": "Ad request has been removed successfully"}),
                200,
            )
        else:
            return jsonify({"error": "Request has not been received to remove"}), 404

    return jsonify({"unauthorized": "You are not authorized"}), 401


@sponsor.route("/get-graph-data")
@login_required
def get_graph_data():
    if isinstance(current_user, Sponsor):
        campaigns = Campaign.query.filter_by(sponsor_id=current_user.sponsor_id).all()
        data = {camp.campaign_title: camp.campaign_expenses for camp in campaigns}

        return jsonify(data)
    return redirect(url_for("main.home"))


@sponsor.route("/get-pie-data")
def get_pie_data():
    num_current_campaign = len(
        Campaign.query.filter_by(sponsor_id=current_user.sponsor_id).all()
    )
    num_all_campaign = len(Campaign.query.all())
    num_not_current_campagin = int(num_all_campaign) - int(num_current_campaign)
    data = {
        "your_camp": num_current_campaign,
        "not_your_camp": num_not_current_campagin,
    }
    return jsonify(data)


@sponsor.route("/delete-camp/<id>", methods=["POST"])
def delete_camp(id):
    try:
        campaign = Campaign.query.get(id)
        if not campaign:
            flash("Campaign not found", "error")
            return redirect(url_for("sponsor.sponsor_details", id=id))
        for ci in campaign.campaign_influencers:
            influencer = Influencer.query.get(ci.influencer_id)
            if influencer:
                influencer.influencer_income -= ci.campaign_amt
                db.session.add(influencer)
            db.session.delete(ci)

        db.session.delete(campaign)
        del_camp_image(campaign.campaign_profile_image)
        db.session.commit()
        flash("Campaign deleted successfully", "success")
        return redirect(url_for("sponsor.sponsor_campaigns"))
    except Exception as e:
        db.session.rollback()
        flash(f"{str(e)}", "error")
        return redirect(url_for("sponsor.sponsor_details", id=id))


@sponsor.route("/delete-sponsor", methods=["POST"])
def delete_sponsor():
    if isinstance(current_user, Sponsor):
        session.pop("user_login_email", "")
        session.pop("user_role", "")
        sponsor_id = request.json

        sponsor = Sponsor.query.get(sponsor_id)
        if not sponsor:
            return jsonify({"error": "Sponsor not found"}), 404

        campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
        for campaign in campaigns:

            CampaignInfluencer.query.filter_by(
                campaign_id=campaign.campaign_id
            ).delete()

            db.session.delete(campaign)

        db.session.delete(sponsor)

        del_spon_image(sponsor.sponsor_profile_image)

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Sponsor profile and related data have been removed successfully"
                }
            ),
            200,
        )

    return jsonify({"unauthorized": "You are not authorized"}), 401


@sponsor.route("/change-salary/<camp_id>/<id>", methods=["POST"])
def change_salary(camp_id, id):
    if isinstance(current_user, Sponsor):
        camp_inf = CampaignInfluencer.query.get(id)
        if not camp_inf:
            flash("Request not found", "error")
            return redirect(url_for("sponsor.sponsor_details", id=id))
        salary = request.form.get("salary")
        updated = False

        if salary:
            salary = salary.strip()
            if salary and int(salary) != camp_inf.campaign_amt:
                camp_inf.campaign_amt = int(salary)
                updated = True
                flash("Changed Salary Successfully", "success")
            else:
                flash("No change detected for Salary", "error")

        if updated:
            db.session.commit()
        else:
            flash("Invalid or No changes detected!", "error")

        return redirect(url_for("sponsor.sponsor_details", id=camp_id))
    return redirect(url_for("main.home"))
