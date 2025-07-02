from setuptools import setup, find_packages

setup(
    name="sushida-ocr",
    version="1.0.0",
    description="寿司打の結果画面からスコアデータを抽出するCLIツール",
    author="mishio",
    packages=find_packages(),
    install_requires=[
        "opencv-python>=4.8.0",
        "pytesseract>=0.3.10",
        "Pillow>=10.0.0",
        "click>=8.1.0",
        "numpy>=1.24.0",
        "colorama>=0.4.6",
    ],
    entry_points={
        "console_scripts": [
            "sushida-ocr=src.cli:main",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
