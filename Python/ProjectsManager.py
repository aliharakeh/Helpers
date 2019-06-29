import os
import subprocess
import shutil
import time

class ProjectsManager(object):

    __PROJECTS_PATH = 'P:\\VSCode_Projects'
    __BACKUP_DIR = 'B:\\'

    def __init__(self):
        self.start_loop()

    def load_projects(self, projects_path):
        return [
            projects_path + '\\' + folder
            for folder in os.listdir(projects_path)
            if not folder.startswith('.')
        ]

    def display_projects(self, projects):
        for index, project in enumerate(projects):
            project_name = project[project.rindex("\\") + 1:]
            print(f'{ index } - { project_name }')

    def backup_version(self, path):
        return f'_v_{len(os.listdir(path))}'

    def backup(self, project_path, project_name):
        backup_parent_path = f'{self.__BACKUP_DIR}{project_name}'

        if not os.path.isdir(backup_parent_path):
            os.mkdir(backup_parent_path)

        backup_path = backup_parent_path + '\\' + project_name + self.backup_version(backup_parent_path)
        shutil.copytree(project_path, backup_path)

    def check_value(self, value, projects):
        return value.isdigit() and 0 <= int(value) < len(projects)

    def insert_command(self, projects):

        self.display_projects(projects)

        args = input('Enter a command [open/delete/backup + index] or [create + name]\n=> ').split(' ')

        if len(args) == 2:

            command = args[0].lower()

            if self.check_value(args[1], projects):

                project = projects[int(args[1])]

                if command == 'open':
                    print('Opening project =>', project)
                    subprocess.Popen(['code', project], shell=True)
                    print('Done !!')

                elif command == 'delete':
                    print('Deleting project =>', project)
                    confirm = input('Are you sure you want to delete the project?[y/n]').lower()
                    if confirm == 'y':
                        shutil.rmtree(project)
                        print('Done !!')
                    else:
                        print('Delete Canceled !!')

                elif command == 'backup':
                    print('Starting backup for =>', project)
                    self.backup(project, project[project.rindex('\\') + 1:])
                    print('Done !!')

                else:
                    print('Invalid Command !!')

            elif command == 'create':
                os.mkdir(self.__PROJECTS_PATH + '\\' + args[1])

            else:
                print('Invalid Command !!')

            return 1

        else:
            return 0

    def start_loop(self):
        while True:
            state = self.insert_command(self.load_projects(self.__PROJECTS_PATH))

            if not state:
                break

            time.sleep(1)

PM = ProjectsManager()