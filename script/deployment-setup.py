#!/usr/bin/env python3

import os
import yaml

TRAVIS_BRANCH = "TRAVIS_BRANCH"
MASTER = "master"
STAGING = "staging"
CONFIG_YML = os.path.join(".", "_config.yml")
BASEURL = "baseurl"
URL = "url"

branch_name = os.environ[TRAVIS_BRANCH]

if branch_name == STAGING:
    with open(CONFIG_YML) as f:
        config = yaml.load(f)
    config[BASEURL] = ""
    config[URL] = "https://staging.iccu.co.uk"
    with open(CONFIG_YML, "w") as f:
        yaml.dump(config, f)
