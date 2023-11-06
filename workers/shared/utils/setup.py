from setuptools import setup, find_packages

with open("readme.md", "r", encoding="utf-8") as readme_file:
    long_description = readme_file.read()

setup(
    name="opencopilot_utils",
    version="1.0.6",
    packages=find_packages(),
    install_requires=[
        "langchain"
    ],
    description="Utility function for getting embeddings, llms, chat completion models etc",
    long_description=long_description,
    long_description_content_type="text/markdown",
)
