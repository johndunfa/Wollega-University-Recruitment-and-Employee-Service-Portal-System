import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install {package}: {e}")
        return False

def main():
    """Install all required dependencies for the resume scorer"""
    print("Installing dependencies for Resume Scorer...")
    print("=" * 50)
    
    # List of required packages
    packages = [
        "flask",
        "flask-cors", 
        "nltk",
        "scikit-learn",
        "numpy",
        "PyPDF2",
        "python-docx",
        "requests"
    ]
    
    failed_packages = []
    
    for package in packages:
        print(f"\nInstalling {package}...")
        if not install_package(package):
            failed_packages.append(package)
    
    print("\n" + "=" * 50)
    
    if failed_packages:
        print(f"❌ Failed to install: {', '.join(failed_packages)}")
        print("Please install these packages manually:")
        for package in failed_packages:
            print(f"  pip install {package}")
    else:
        print("✅ All dependencies installed successfully!")
    
    print("\nNext steps:")
    print("1. Run the Flask server: python scripts/flask_server.py")
    print("2. The server will be available at http://localhost:8000")
    print("3. Use the frontend to upload job descriptions and resumes")

if __name__ == "__main__":
    main()
