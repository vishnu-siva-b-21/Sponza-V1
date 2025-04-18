from flask import (
    current_app,
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    jsonify,
    session,
)
from sponza_app.models import Influencer, Campaign, Sponsor, CampaignInfluencer
from sponza_app import db, bcrypt
from flask_login import current_user, logout_user, login_required
from sponza_app.modules.influencer.utils import (
    del_save_image,
    return_profile_image,
    return_campaign_image,
    del_inf_image,
)
from datetime import date


influencer = Blueprint("influencer", __name__)


@influencer.route("/register", methods=["POST", "GET"])
def influencer_register():
    if isinstance(current_user, Influencer):
        return redirect(url_for("influencer.influencer_dashboard"))
    existing_user = Influencer.query.filter_by(
        email=request.form.get("email").strip()
    ).first()
    if existing_user is None:
        hashed_password = bcrypt.generate_password_hash(
            request.form.get("password").strip()
        ).decode("utf-8")
        influencer = Influencer(
            influencer_user_name=request.form.get("username").strip(),
            email=request.form.get("email").strip(),
            influencer_niche=request.form.get("niche").strip(),
            influencer_social_media_platform=request.form.get("platform"),
            influencer_social_media_link=request.form.get(
                "influencer_social_media_link"
            ),
            password=hashed_password,
        )
        db.session.add(influencer)
        db.session.commit()
        flash(f"Influencer added successfully", "success")
    else:
        flash(
            f"Influencer already exists, Please use a different email.",
            "error",
        )
    return redirect(url_for("main.home"))


@influencer.route("/dashboard")
@login_required
def influencer_dashboard():
    if isinstance(current_user, Influencer):
        image = return_profile_image(current_user.influencer_profile_image)
        accepted_camp = []

        for camp_inf in CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id, status="accepted"
        ).all():
            camp = camp_inf.campaign
            total_camp_days = (camp.campaign_end_date - camp.campaign_start_date).days
            completed_camp_days = (date.today() - camp.campaign_start_date).days
            progress = (
                int((completed_camp_days / total_camp_days) * 100)
                if total_camp_days > 0
                else 0
            )

            inf_data = {
                "id": camp.campaign_id,
                "title": camp.campaign_title,
                "sponsor": Sponsor.query.get(camp.sponsor_id).sponsor_company_name,
                "progress": progress,
                "desc": camp.campaign_desc,
                "end_date": camp.campaign_end_date,
                "image": return_campaign_image(camp.campaign_profile_image),
                "camp_amt": camp_inf.campaign_amt,
                "flag": camp.admin_flag,
            }
            accepted_camp.append(inf_data)

        pending_requests_count = CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id, status="camp_sent_pending"
        ).count()

        num_total_camp = len(Campaign.query.all())

        return render_template(
            "influencer/influencer_dashboard.html",
            title="Influencer - Dashboard",
            influencer_name=current_user.influencer_user_name,
            influencer_id=current_user.influencer_id,
            influencer_income=current_user.influencer_income,
            image=image,
            campaigns=accepted_camp,
            num_total_camp=num_total_camp,
            pending_requests_count=pending_requests_count,
        )
    return redirect(url_for("main.home"))


@influencer.route("/campaigns")
@login_required
def influencer_campaigns():
    if isinstance(current_user, Influencer):
        image = return_profile_image(current_user.influencer_profile_image)
        sponsor_name = ""

        page = request.args.get("page", 1, type=int)
        per_page = 6

        if request.args.get("id"):
            sponsor_id = request.args.get("id")
            all_camp = Campaign.query.filter_by(
                sponsor_id=sponsor_id, admin_flag="False"
            ).paginate(page=page, per_page=per_page)
            sponsor_name = Sponsor.query.get(sponsor_id).sponsor_company_name
        else:
            all_camp = Campaign.query.filter_by(admin_flag="False").paginate(
                page=page, per_page=per_page
            )

        for camp in all_camp.items:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )
            camp.sponser_name = Sponsor.query.get(camp.sponsor_id).sponsor_company_name

        inf_camp = CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id
        ).all()

        inf_camp_ids = [camp_inf.campaign_id for camp_inf in inf_camp]
        non_inf_camp = [
            camp for camp in all_camp.items if camp.campaign_id not in inf_camp_ids
        ]

        return render_template(
            "influencer/influencer_campaigns.html",
            title="Influencer - Campaigns",
            influencer_name=current_user.influencer_user_name,
            influencer_id=current_user.influencer_id,
            image=image,
            all_camp=non_inf_camp,
            sponsor_name=sponsor_name,
            pagination=all_camp,
        )
    return redirect(url_for("main.home"))


@influencer.route("/campaigns/search")
@login_required
def search_campaigns():
    if isinstance(current_user, Influencer):
        search_query = request.args.get("q", "")
        if search_query:

            all_camp = Campaign.query.filter(
                Campaign.admin_flag == "False",
                Campaign.campaign_title.ilike(f"%{search_query}%"),
            ).all()
        else:

            all_camp = Campaign.query.all()

        for camp in all_camp:
            camp.campaign_profile_image = return_campaign_image(
                camp.campaign_profile_image
            )
            camp.sponser_name = Sponsor.query.get(camp.sponsor_id).sponsor_company_name

        inf_camp = CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id
        ).all()

        inf_camp_ids = [camp_inf.campaign_id for camp_inf in inf_camp]
        non_inf_camp = [
            camp for camp in all_camp if camp.campaign_id not in inf_camp_ids
        ]

        image = return_profile_image(current_user.influencer_profile_image)

        return render_template(
            "influencer/influencer_campaigns.html",
            title="Influencer - Campaigns",
            influencer_name=current_user.influencer_user_name,
            influencer_id=current_user.influencer_id,
            image=image,
            all_camp=non_inf_camp,
            sponsor_name="",
            search_query=search_query,
            is_search=1,
        )
    return redirect(url_for("main.home"))


@influencer.route("/requests")
@login_required
def influencer_requests():
    if isinstance(current_user, Influencer):
        image = return_profile_image(current_user.influencer_profile_image)
        inf_sent_pending = []
        camp_sent_pending = []

        for camp in CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id, status="inf_sent_pending"
        ).all():
            camp_data = {
                "main_id": camp.ci_id,
                "id": camp.campaign.campaign_id,
                "title": camp.campaign.campaign_title,
                "sponsor": Sponsor.query.get(
                    camp.campaign.sponsor_id
                ).sponsor_company_name,
                "image": return_campaign_image(camp.campaign.campaign_profile_image),
                "camp_pay": camp.campaign_amt,
            }
            inf_sent_pending.append(camp_data)

        for camp in CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id, status="camp_sent_pending"
        ).all():
            camp_data = {
                "main_id": camp.ci_id,
                "id": camp.campaign.campaign_id,
                "title": camp.campaign.campaign_title,
                "desc": camp.campaign.campaign_desc,
                "end_date": camp.campaign.campaign_end_date,
                "sponsor_company_name": Sponsor.query.get(
                    camp.campaign.sponsor_id
                ).sponsor_company_name,
                "camp_amt": camp.campaign_amt,
                "image": return_campaign_image(camp.campaign.campaign_profile_image),
                "camp_pay": camp.campaign_amt,
            }
            camp_sent_pending.append(camp_data)
        return render_template(
            "influencer/influencer_request.html",
            title="Influencer - Requests",
            influencer_name=current_user.influencer_user_name,
            influencer=current_user,
            inf_sent_pending=inf_sent_pending,
            camp_sent_pending=camp_sent_pending,
            image=image,
        )
    return redirect(url_for("main.home"))


@influencer.route("/profile")
@login_required
def influencer_profile():
    if isinstance(current_user, Influencer):
        image = return_profile_image(current_user.influencer_profile_image)
        return render_template(
            "influencer/influencer_profile.html",
            title="Influencer - Profile",
            influencer_name=current_user.influencer_user_name,
            influencer=current_user,
            image=image,
        )
    return redirect(url_for("main.home"))


@influencer.route("/update-profile", methods=["POST", "GET"])
@login_required
def update_profile():
    if request.method == "POST":
        file_name = (
            del_save_image(
                request.files["profile_pic"], request.args.get("file"), "influencer"
            )
            if request.files["profile_pic"]
            else request.args.get("file")
        )
        Influencer.query.filter_by(email=current_user.email).update(
            dict(
                influencer_user_name=request.form.get("username").strip(),
                email=request.form.get("email").strip(),
                influencer_profile_image=file_name,
                influencer_social_media_platform=request.form.get("platform"),
                influencer_social_media_link=request.form.get(
                    "influencer_social_media_link"
                ),
            )
        )
        db.session.commit()
        flash("Profile updated successfully", "success")
        return redirect(url_for("influencer.influencer_profile"))
    return redirect(url_for("influencer.influencer_profile"))


@influencer.route("/send-ad-request/<camp_id>", methods=["POST"])
@login_required
def send_ad_request(camp_id):
    ad_data = request.json
    print(ad_data)
    inf_id = ad_data["adInfluencerid"]
    camp_pay = ad_data["adPayment"]

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
        if camp_inf.status == "inf_sent_pending":
            return jsonify({"error": "Ad request already sent"}), 409
        elif camp_inf.status == "camp_sent_pending":
            return jsonify({"error": "Ad request already recieved"}), 409
        elif camp_inf.status == "accepted":
            return jsonify({"error": "Ad request already accepted"}), 409
        else:
            print(camp_inf.status)
            return jsonify({"error": "Error"}), 404

    campaign_influencer = CampaignInfluencer(
        campaign_id=campaign.campaign_id,
        influencer_id=influencer.influencer_id,
        campaign_amt=int(camp_pay),
        status="inf_sent_pending",
    )

    db.session.add(campaign_influencer)
    db.session.commit()

    return jsonify({"message": "Ad request sent successfully"}), 200


@influencer.route("/accept-ad-req", methods=["POST"])
def accept_ad_req():
    if isinstance(current_user, Influencer):
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


@influencer.route("/rm-ad-req", methods=["POST"])
def rm_ad_req():
    if isinstance(current_user, Influencer):
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


@influencer.route("/get-graph-data")
@login_required
def get_graph_data():
    if isinstance(current_user, Influencer):
        campaigns_influencer = (
            db.session.query(Campaign.campaign_title, Campaign.campaign_expenses)
            .join(
                CampaignInfluencer,
                Campaign.campaign_id == CampaignInfluencer.campaign_id,
            )
            .filter(
                CampaignInfluencer.influencer_id == current_user.influencer_id,
                CampaignInfluencer.status == "accepted",
            )
            .all()
        )

        data = {
            campaign.campaign_title: campaign.campaign_expenses
            for campaign in campaigns_influencer
        }

        return jsonify(data)

    return redirect(url_for("main.home"))


@influencer.route("/get-pie-data")
def get_pie_data():
    num_current_campaign = len(
        CampaignInfluencer.query.filter_by(
            influencer_id=current_user.influencer_id, status="accepted"
        ).all()
    )
    num_all_campaign = len(Campaign.query.all())
    num_not_current_campagin = int(num_all_campaign) - int(num_current_campaign)
    data = {
        "your_camp": num_current_campaign,
        "not_your_camp": num_not_current_campagin,
    }
    return jsonify(data)


@influencer.route("/delete-influencer", methods=["POST"])
def delete_influencer():
    if isinstance(current_user, Influencer):
        session.pop("user_login_email", "")
        session.pop("user_role", "")
        influencer_id = request.json.get("id")

        influencer = Influencer.query.get(influencer_id)
        if not influencer:
            return jsonify({"error": "Influencer not found"}), 404

        campaign_influencers = CampaignInfluencer.query.filter_by(
            influencer_id=influencer_id
        ).all()
        for ci in campaign_influencers:
            db.session.delete(ci)

        db.session.delete(influencer)
        del_inf_image(influencer.influencer_profile_image)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Influencer profile and related data have been removed successfully"
                }
            ),
            200,
        )

    return jsonify({"unauthorized": "You are not authorized"}), 401


@influencer.route("/change-salary/<id>", methods=["POST"])
def change_salary(id):
    if isinstance(current_user, Influencer):
        camp_inf = CampaignInfluencer.query.get(id)
        if not camp_inf:
            flash("Request not found", "error")
            return redirect(url_for("influencer.influencer_details", id=id))
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

        return redirect(url_for("influencer.influencer_requests"))
    return redirect(url_for("main.home"))
