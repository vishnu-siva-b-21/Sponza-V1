import os
from dotenv import load_dotenv

load_dotenv()


class Config(object):
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = eval(os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS"))
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_PORT = eval(os.getenv("MAIL_PORT"))
    MAIL_USE_TLS = eval(os.getenv("MAIL_USE_TLS"))
    MAIL_USE_SSL = eval(os.getenv("MAIL_USE_SSL"))
