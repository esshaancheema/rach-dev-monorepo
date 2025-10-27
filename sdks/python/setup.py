"""
Setup script for Zoptal Python SDK
"""

from setuptools import setup, find_packages

# Read the README file
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    install_requires = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="zoptal-sdk",
    version="1.0.0",
    author="Zoptal Development Team",
    author_email="sdk@zoptal.com",
    description="Official Python SDK for the Zoptal AI-powered development platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/zoptal/zoptal-python-sdk",
    project_urls={
        "Bug Tracker": "https://github.com/zoptal/zoptal-python-sdk/issues",
        "Documentation": "https://docs.zoptal.com/sdks/python",
        "Source Code": "https://github.com/zoptal/zoptal-python-sdk",
        "Homepage": "https://zoptal.com"
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
        "Topic :: Software Development :: Code Generators",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=install_requires,
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=22.0",
            "isort>=5.0",
            "flake8>=4.0",
            "mypy>=0.900",
            "pre-commit>=2.0",
        ],
        "docs": [
            "sphinx>=4.0",
            "sphinx-rtd-theme>=1.0",
            "myst-parser>=0.17",
        ],
        "async": [
            "aiohttp>=3.8.0",
            "asyncio>=3.4.3",
        ]
    },
    entry_points={
        "console_scripts": [
            "zoptal=zoptal_sdk.cli:main",
        ],
    },
    keywords=[
        "zoptal", 
        "ai", 
        "development", 
        "code-generation", 
        "collaboration",
        "api",
        "sdk",
        "python"
    ],
    include_package_data=True,
    zip_safe=False,
)