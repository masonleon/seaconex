# setup.py

from setuptools import setup, find_packages

INSTALL_REQUIRES = ['requests', 'geopandas', 'shapely']

setup(
    name='seaconex',
    version='0.1',
    author='Mason Leon',
    description='Tools for SeaCONEX Visualizing Maritime Supply Chain Networks',
    url='https://github.com/NEU-CS-7250-S21/project-group-09-seaconex',
    packages=find_packages(),
    python_requires='>=3.7',
    install_requires=INSTALL_REQUIRES
)
