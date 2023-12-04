from setuptools import setup, find_packages

with open("readme.md", "r", encoding="utf-8") as readme_file:
    long_description = readme_file.read()

setup(
    name="opencopilot_db",
    version="6.0.0-rc.1",
    packages=find_packages(),
    install_requires=[
        "sqlalchemy",
        "pymysql"
    ],
    description="Database schemas for OpenCopilot microservices and plugins",
    long_description=long_description,
    long_description_content_type="text/markdown",
)
