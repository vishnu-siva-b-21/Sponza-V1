from flask import (
    current_app,
    url_for,
)
import os
from sponza_app import mail
from flask_mail import Message


def return_sponsor_profile_image(profile_image):
    image_file = f"sponsor/images/profile_pics/{profile_image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if not os.path.exists(image_path):
        image_file = "sponsor/images/profile_pics/sponsor.png"
    return url_for("static", filename=image_file)


def return_inf_profile_image(profile_image):
    image_file = f"influencer/images/profile_pics/{profile_image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if not os.path.exists(image_path):
        image_file = "influencer/images/profile_pics/influencer.png"
    return url_for("static", filename=image_file)


def return_campaign_image(image):
    image_file = f"sponsor/images/campaigns/{image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if not os.path.exists(image_path):
        image_file = "sponsor/images/campaigns/campaign.png"
    return url_for("static", filename=image_file)


def send_flag_mail(user, role):
    msg = Message(
        "Flag Warning Mail",
        sender="admin@gmail.com",
        recipients=[user.email],
    )
    msg.body = f"""Subject: Account Temporarily Disabled - Immediate Action Required

Dear {role},

We hope this message finds you well. We are writing to inform you that your account on our platform has been temporarily disabled because our admin flagged it.
To resolve this issue and restore your account,please reply to this email at your earliest convenience. Our team will assist you with the necessary steps to reactivate your account.

Please be aware that if we do not receive a response from you within 10 days of this email, your account will be permanently deleted, along with all associated data.

We apologize for any inconvenience this may cause and appreciate your prompt attention to this matter.

Best regards"""
    mail.send(msg)


def send_camp_flag_mail(user, camp_name):
    msg = Message(
        "Flag Warning Mail",
        sender="admin@gmail.com",
        recipients=[user.email],
    )
    msg.body = f"""Subject: Campaign Flagged by Admin - Immediate Action Required

Dear Sponsor,

We hope this message finds you well. We are writing to inform you that {camp_name} campaign on our platform has been flagged by our admin team due to some reason. As a result, no further operations can be performed on this campaign until the issue is resolved.

To address this matter and avoid any disruption, please reply to this email at your earliest convenience. Our team will assist you with the necessary steps to resolve the issue.
Please note that if we do not receive a response from you within 5 days of this email, the campaign will be automatically deleted, and all associated data will be permanently lost.

We apologize for any inconvenience this may cause and appreciate your prompt attention to this issue.

Best regards."""
    mail.send(msg)
