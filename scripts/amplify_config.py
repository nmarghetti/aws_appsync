#! /bin/env python

import iniparse
import os
import sys
from getpass import getpass
from optparse import OptionParser, OptionGroup, Option

# It adds an example section at the end of the help
class ExOptionParser(OptionParser):
    def __init__(self,
            usage=None,
            option_list=None,
            option_class=Option,
            version=None,
            conflict_handler="error",
            description=None,
            formatter=None,
            add_help_option=True,
            prog=None,
            epilog=None,
            example=None):
        OptionParser.__init__(self, usage=usage, option_list=option_list, option_class=option_class, version=version,
                              conflict_handler=conflict_handler, description=description, formatter=formatter,
                              add_help_option=add_help_option, prog=prog, epilog=epilog)
        self.example = example

    def format_help(self, formatter=None):
        result = OptionParser.format_help(self, formatter)
        if self.example:
            result += '\n' + self.expand_prog_name(self.example)
        return result

USAGE = '''%prog [option]'''

EXAMPLE="""________________________________________________________________________________

Examples:

%prog -l
%prog -c
%prog -p admin -k ACCESSKEY -s SECRETACCESSKEY
________________________________________________________________________________
"""

EPILOG = '''It allows to list, create or update AWS credentials profile'''


def get_input(prompt, secret=False):
  '''Read input from user'''
  if secret:
    return getpass(prompt)
  sys.stdout.write(prompt)
  sys.stdout.flush()
  return sys.stdin.readline().strip()

def get_home(userprofile=False):
  '''Return path to home'''
  if userprofile:
    home = os.getenv('USERPROFILE')
    if not home:
      return None
  else:
    home = os.path.expanduser('~')
  return home

def get_credentials_path(userprofile=False):
  '''Return path to credentials file'''
  home = get_home(userprofile)
  if not home:
    return None

  # Get credentials file path
  credentials_file = os.path.join(home, '.aws', 'credentials')

  # Create credentials file if not exist
  if not os.path.exists(credentials_file):
    os.makedirs(os.path.dirname(credentials_file), exist_ok=True)
    with open(credentials_file, 'a+'): pass

  return credentials_file

def get_config_path(userprofile=False):
  '''Return path to config file'''
  home = get_home(userprofile)
  if not home:
    return None

  # Get config file path
  config_file = os.path.join(home, '.aws', 'config')

  # Create config file if not exist
  if not os.path.exists(config_file):
    os.makedirs(os.path.dirname(config_file), exist_ok=True)
    with open(config_file, 'a+'): pass

  return config_file

def print_existing_profile(credentials_file):
  '''Print existing credentials profiles'''
  if not credentials_file or not os.path.exists(credentials_file):
    return

  # Read credentials file
  config = iniparse.ConfigParser()
  config.read(credentials_file)

  if config.sections():
    print (f'Already existing profile from {credentials_file}: {config.sections()}')

def save_config(config, file):
  if not file or not os.path.exists(file):
    return

def save_profile(profile=None, key=None, secret=None, region=None, user_profile=False):
  '''Save profile in credentials and config files'''
  credentials_file = get_credentials_path(user_profile)
  if not credentials_file or not os.path.exists(credentials_file):
    return
  config_file = get_config_path(user_profile)
  if not config_file or not os.path.exists(config_file):
    return
  # Read credentials file
  config = iniparse.ConfigParser()
  config.read(credentials_file)
  # Update config
  if not config.has_section(profile):
    config.add_section(profile)
  config.set(profile, 'aws_access_key_id', key)
  config.set(profile, 'aws_secret_access_key', secret)
  # Write config
  with open(credentials_file, 'w') as output:
    config.write(output)

  # Read config file
  config = iniparse.ConfigParser()
  config.read(config_file)
  # Update config
  if not config.has_section(profile):
    config.add_section(profile)
  config.set(profile, 'region', region)
  # Write config
  with open(config_file, 'w') as output:
    config.write(output)

def delete_profile(profile=None, user_profile=False):
  '''Delete profile in credentials and config files'''
  credentials_file = get_credentials_path(user_profile)
  if not credentials_file or not os.path.exists(credentials_file):
    return
  config_file = get_config_path(user_profile)
  if not config_file or not os.path.exists(config_file):
    return
  # Read credentials file
  config = iniparse.ConfigParser()
  config.read(credentials_file)
  # Update config
  if config.has_section(profile):
    config.remove_section(profile)
  # Write config
  with open(credentials_file, 'w') as output:
    config.write(output)

  # Read config file
  config = iniparse.ConfigParser()
  config.read(config_file)
  # Update config
  if config.has_section(profile):
    config.remove_section(profile)
  # Write config
  with open(config_file, 'w') as output:
    config.write(output)

def create_profile(profile=None, key=None, secret=None, region=None):
  print(secret)
  '''Create a new profile'''
  # Create new profile
  print('Creating a new profile')
  if profile is None:
    profile = get_input('profile name:')
  if region is None:
    region = get_input('region:')
  if key is None:
    key = get_input('access key:')
  if secret is None:
    secret = get_input('secret access key:', secret=True)

  save_profile(profile, key, secret, region)
  save_profile(profile, key, secret, region, user_profile=True)

if __name__ == '__main__':
    parser = ExOptionParser(usage=USAGE, example=EXAMPLE, epilog=EPILOG)
    parser.add_option('-d', '--debug', dest='debug', action='store_true', help='Set debug mode', default=False)
    group = OptionGroup(parser, 'config options')
    group.add_option('-p', '--profile', help='Profile name to create', default=None)
    group.add_option('-k', '--key', help='AWS access key', default=None)
    group.add_option('-s', '--secret', help='AWS secret access key', default=None)
    group.add_option('-r', '--region', help='AWS region (default=%default)', default='eu-west-1')
    group.add_option('-l', '--list', action='store_true', help=f'List existing AWS credential profiles', default=False)
    group.add_option('--delete', action='store_true', help=f'Delete AWS credential profile', default=False)
    parser.add_option_group(group)

    try:
        (OPTIONS, ARGS) = parser.parse_args()
        DEBUG = OPTIONS.debug
        if OPTIONS.list:
          print_existing_profile(get_credentials_path())
          print_existing_profile(get_credentials_path(True))
        elif OPTIONS.delete:
          if not OPTIONS.profile:
            print('Please provide the profile to delete')
            sys.exit(1)
          delete_profile(profile=OPTIONS.profile)
          delete_profile(profile=OPTIONS.profile, user_profile=True)
        else:
          create_profile(profile=OPTIONS.profile, key=OPTIONS.key, secret=OPTIONS.secret, region=OPTIONS.region)
    except Exception as e:
        if DEBUG:
            traceback.print_exc(file=sys.stdout)
        print(e)
        sys.exit(1)

