from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    request,
    jsonify,
    session,
)
from sponza_app.models import Influencer, Sponsor, Admin
from sponza_app import db, bcrypt
from flask_login import current_user, login_user, login_required, logout_user
from sponza_app.modules.main.utils import send_mail

main = Blueprint("main", __name__)


@main.route("/")
def home():
    if current_user.is_authenticated:
        flash("You are already authenticated and Logged in", category="success")
        if isinstance(current_user, Influencer):
            return redirect(url_for("influencer.influencer_dashboard"))
        elif isinstance(current_user, Sponsor):
            return redirect(url_for("sponsor.sponsor_dashboard"))
        elif isinstance(current_user, Admin):
            return redirect(url_for("admin.admin_dashboard"))
    user_login_email = session.pop("user_login_email", "")
    user_role = session.pop("user_role", "")
    return render_template(
        "main/home.html", user_login_email=user_login_email, user_role=user_role
    )


@main.route("/login", methods=["POST", "GET"])
def user_login():
    if request.method == "POST":
        session["user_login_email"] = request.form.get("email").strip()
        session["user_role"] = request.form.get("role")
        if request.form.get("role") == "sponsor":
            user = Sponsor.query.filter_by(
                email=request.form.get("email").strip()
            ).first()
        elif request.form.get("role") == "influencer":
            user = Influencer.query.filter_by(
                email=request.form.get("email").strip()
            ).first()
        elif request.form.get("role") == "admin":
            user = Admin.query.filter_by(
                email=request.form.get("email").strip()
            ).first()
        else:
            flash("Invaild role selected!", "warning")
            return redirect(url_for("main.home"))
        remember_me = True if request.form.get("remember_me") else False
        if request.form.get("role") != "admin" and user.admin_flag == "True":
            flash(
                "Your account has been temporarily blocked. Please check your email for more details.",
                "warning",
            )
            return redirect(url_for("main.home"))
        if user:
            if bcrypt.check_password_hash(
                user.password, request.form.get("password").strip()
            ):
                print(user)
                login_user(user, remember=remember_me)
                print(user)
                next_page = request.args.get("next")
                (
                    flash(
                        "You are already authenticated and Logged in",
                        category="success",
                    )
                    if next_page
                    else flash("Login successful", category="success")
                )
                return (
                    redirect(next_page)
                    if next_page
                    else redirect(
                        url_for(
                            f"{request.form.get('role')}.{request.form.get('role')}_dashboard"
                        )
                    )
                )
            else:
                flash("Invalid password. Please try again.", category="error")
                return redirect(url_for("main.home"))
        else:
            flash("Email not found. Please try again.", category="error")
            return redirect(url_for("main.home"))
    else:
        return redirect(url_for("main.home"))


@main.route("/logout")
@login_required
def user_logout():
    session.pop("user_login_email", "")
    session.pop("user_role", "")
    logout_user()
    flash("You have been logged out", category="success")
    return redirect(url_for("main.home"))


@main.route("/db-drop-all")
def db_drop_all():
    db.drop_all()
    flash("Dropped all the database", "success")
    return redirect(url_for("main.home"))


@main.route("/user-reset-request", methods=["POST"])
def user_reset_request():
    if current_user.is_authenticated:
        return jsonify({"authorized": "You are already authenticated and Logged in"})
    if request.method == "POST":
        data = request.json
        email = data.get("email")
        role = data.get("role")
        if role == "influencer":
            user = Influencer.query.filter_by(email=email).first()
        elif role == "sponsor":
            user = Sponsor.query.filter_by(email=email).first()
        if user:
            send_mail(user, user.get_reset_token(), role)
            return (
                jsonify(
                    {
                        "message": "An email has been sent with the instructions to reset your password"
                    }
                ),
                200,
            )
        else:
            return jsonify({"error": "Invalid Data or Email not registred!"}), 404


@main.route("/user-reset-password/<role>/<token>", methods=["GET", "POST"])
def user_reset_password(role, token):
    if current_user.is_authenticated:
        flash("You are already authenticated and Logged in", category="success")
        return redirect(url_for("main.home"))

    user = (
        Influencer.verify_reset_token(token)
        if role == "influencer"
        else Sponsor.verify_reset_token(token)
    )

    if user is None:
        flash("That Token is Invalid or Expired!", category="warning")
        return redirect(url_for("main.home"))

    if request.method == "POST":
        hashed_password = bcrypt.generate_password_hash(
            request.form.get("password").strip()
        ).decode("utf-8")
        user.password = hashed_password
        user.reset_token_used = 1
        db.session.commit()

        flash(
            "Your Password has been updated successfully, you can now login with your new password",
            "success",
        )
        return redirect(url_for("main.home"))

    return render_template("main/reset_password.html", token=token, role=role)


@main.route("/get-all-users/<role>", methods=["POST"])
def get_all_users(role):
    if role == "sponsor":
        users = Sponsor.query.all()
    elif role == "influencer":
        users = Influencer.query.all()
    else:
        return {"error": "role not found"}, 404
    user_list = [user.email for user in users]
    return jsonify(user_list)
