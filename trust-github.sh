#!/bin/sh

# Adds the SSH public key for GitHub to the file defined in the KNOWN_HOSTS varible (below),
# provided that the key matches the publicy published key fingerprint from GitHub.

# Fingerprint can be fetched from https://help.github.com/articles/github-s-ssh-key-fingerprints/
# This should only ever change if GitHub's private keys are compromised and the keys are recreated.

SHA256_RSA_FINGERPRINT="SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8"
KNOWN_HOSTS=~/.ssh/known_hosts

ssh-keyscan github.com 2>/dev/null | tee keyscan.txt | cut -f 2,3 -d ' ' | ssh-keygen -lf - | cut -f 2 -d ' ' | grep -q "$SHA256_RSA_FINGERPRINT" && cat keyscan.txt >> $KNOWN_HOSTS && rm keyscan.txt || (echo FAIL && exit 1)
