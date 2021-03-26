# seaconex/geo.py

import re

"""
https://www.javaer101.com/en/article/18832510.html
https://stackoverflow.com/questions/33997361

Converting Degrees, Minutes, Seconds formatted coordinate strings to decimal.

Formula:
DEC = (DEG + (MIN * 1/60) + (SEC * 1/60 * 1/60))

Assumes S/W are negative.
"""


def dms2dd(s):
    # example: s = """0°51'56.29"S"""
    degrees, minutes, seconds, direction = re.split('[°\'"]+', s)
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)
    if direction in ('S', 'W'):
        dd *= -1
    return dd
