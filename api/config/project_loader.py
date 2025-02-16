# app/api/config/project_loader.py
import json
import os
from typing import Dict, Optional
from dataclasses import dataclass

@dataclass
class Project:
    id: str
    title: str
    description: str
    starter_code: str
    test_code: str
    solution: str
    theme: str = "default"
    difficulty: str = "beginner"
    estimated_time: str = "1 hour"
    tags: list = None

class ProjectLoader:
    _instance = None
    _projects = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ProjectLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._projects is None:
            self._load_projects()

    def _load_projects(self):
        """Load projects from JSON file"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))
        config_path = os.path.join(project_root, 'config', 'project_configs.json')

        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
                self._projects = {}
                for project_id, project_data in data.items():
                    self._projects[project_id] = Project(
                        id=project_data['id'],
                        title=project_data['title'],
                        description=project_data['description'],
                        starter_code=project_data.get('starterCode', ''),
                        test_code=project_data.get('testCode', ''),
                        solution=project_data.get('solution', ''),
                        theme=project_data.get('theme', 'default'),
                        difficulty=project_data.get('difficulty', 'beginner'),
                        estimated_time=project_data.get('estimatedTime', '1 hour'),
                        tags=project_data.get('tags', [])
                    )

            # print(self._projects)
        except Exception as e:
            # print(f"Error loading project configs: {e}")
            self._projects = {}

    def get_project(self, project_id: str) -> Optional[Project]:
        return self._projects.get(project_id)

    def get_all_projects(self) -> Dict[str, Project]:
        return self._projects

project_loader = ProjectLoader()

def get_project(project_id: str) -> Optional[Project]:
    # print("getting project")
    return project_loader.get_project(project_id)

def get_all_projects() -> Dict[str, Project]:
    return project_loader.get_all_projects()