#!/usr/bin/env python3
"""
Change _config.yml variables as appropriate for branch
"""

import os

TRAVIS_BRANCH = "TRAVIS_BRANCH"
MASTER = "master"
STAGING = "staging"
CONFIG_YML = os.path.join(".", "_config.yml")
BASEURL = "baseurl"
URL = "url"

branch_name = os.environ[TRAVIS_BRANCH]

if branch_name == MASTER:
    pass
    # TODO: change _config.yml to iccu.co.uk settings
elif branch_name == STAGING:
    with open(CONFIG_YML) as f:
        config = yaml.load(f)
    config[BASEURL] = "/iccu-website"
    config[URL] = "https://imperial-cu.github.io/iccu-website"

    with open(CONFIG_YML, "w") as f:
        yaml.dump(list_doc, f)
