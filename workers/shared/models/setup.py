from setuptools import setup, find_packages

setup(
    name="opencopilot_db",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "sqlalchemy",
        "pymysql"
        # Add any other dependencies here
    ],
)