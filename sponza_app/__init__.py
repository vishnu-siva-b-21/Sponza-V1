from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from flask_apscheduler import APScheduler
from sponza_app.config import Config
from datetime import datetime, timedelta, timezone, date

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
mail = Mail()
scheduler = APScheduler()
login_manager.login_view = "main.user_login"
login_manager.login_message_category = "info"


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    mail.init_app(app)
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    scheduler.init_app(app)

    @app.before_request
    def make_session_permanent():
        session.permanent = False

    # Importing all blueprints
    from sponza_app.modules.main import main
    from sponza_app.modules.influencer import influencer
    from sponza_app.modules.sponsor import sponsor
    from sponza_app.modules.admin import admin
    from sponza_app.modules.errors import errors

    # Register all blueprints, setting their URL prefix
    app.register_blueprint(main, url_prefix="/")
    app.register_blueprint(influencer, url_prefix="/influencer")
    app.register_blueprint(sponsor, url_prefix="/sponsor")
    app.register_blueprint(admin, url_prefix="/admin")
    app.register_blueprint(errors)

    def delete_ended_campaigns():
        from sponza_app.models import Influencer, Campaign
        from sponza_app.modules.sponsor.utils import del_camp_image

        with app.app_context():
            ended_campaigns = Campaign.query.filter(
                date.today() >= Campaign.campaign_end_date,
            ).all()
            for campaign in ended_campaigns:
                for ci in campaign.campaign_influencers:
                    influencer = Influencer.query.get(ci.influencer_id)
                    if influencer:
                        influencer.influencer_income -= ci.campaign_amt
                        db.session.add(influencer)
                    db.session.delete(ci)
                db.session.delete(campaign)
                del_camp_image(campaign.campaign_profile_image)
                db.session.commit()

    def delete_flagged_campaigns():
        from sponza_app.models import Influencer, Campaign
        from sponza_app.modules.sponsor.utils import del_camp_image

        with app.app_context():
            expired_campaigns = Campaign.query.filter(
                Campaign.admin_flag == "True",
                datetime.now(timezone.utc)
                >= Campaign.admin_flag_time + timedelta(hours=24),
            ).all()
            for campaign in expired_campaigns:
                for ci in campaign.campaign_influencers:
                    influencer = Influencer.query.get(ci.influencer_id)
                    if influencer:
                        influencer.influencer_income -= ci.campaign_amt
                        db.session.add(influencer)
                    db.session.delete(ci)
                db.session.delete(campaign)
                del_camp_image(campaign.campaign_profile_image)
                db.session.commit()

    def delete_flagged_users():
        from sponza_app.models import (
            Influencer,
            Sponsor,
            Campaign,
            CampaignInfluencer,
        )
        from sponza_app.modules.sponsor.utils import del_spon_image
        from sponza_app.modules.influencer.utils import del_inf_image

        with app.app_context():
            expired_influencers = Influencer.query.filter(
                Influencer.admin_flag == "True",
                datetime.now(timezone.utc)
                >= Influencer.admin_flag_time + timedelta(hours=240),
            ).all()
            for influencer in expired_influencers:
                campaign_influencers = CampaignInfluencer.query.filter_by(
                    influencer_id=influencer.influencer_id
                ).all()
                for ci in campaign_influencers:
                    db.session.delete(ci)
                del_inf_image(influencer.influencer_profile_image)
                db.session.delete(influencer)
            expired_sponsors = Sponsor.query.filter(
                Sponsor.admin_flag == "True",
                datetime.now(timezone.utc)
                <= Influencer.admin_flag_time + timedelta(hours=240),
            ).all()
            for sponsor in expired_sponsors:
                campaigns = Campaign.query.filter_by(
                    sponsor_id=sponsor.sponsor_id
                ).all()
                for campaign in campaigns:
                    CampaignInfluencer.query.filter_by(
                        campaign_id=campaign.campaign_id
                    ).delete()
                    db.session.delete(campaign)
                del_spon_image(sponsor.sponsor_profile_image)
                db.session.delete(sponsor)
            db.session.commit()

    def schedule_jobs():
        scheduler.add_job(
            func=delete_flagged_campaigns,
            trigger="interval",
            minutes=1,
            id="camp_flag_del",
        )
        scheduler.add_job(
            func=delete_flagged_users,
            trigger="interval",
            minutes=1,
            id="user_flag_del",
        )
        scheduler.add_job(
            func=delete_ended_campaigns,
            trigger="interval",
            minutes=1,
            id="camp_end_del",
        )
        scheduler.start()

    def run_on_startup():
        delete_ended_campaigns()
        delete_flagged_campaigns()
        delete_flagged_users()

    # Initialize the application
    with app.app_context():
        db.create_all()
        schedule_jobs()

        run_on_startup()

    return app
