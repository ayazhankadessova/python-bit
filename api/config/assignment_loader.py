# app/api/config/assignment_loader.py
import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class Example:
    id: str
    inputText: str
    outputText: str
    explanation: str

@dataclass
class Assignment:
    id: str
    title: str
    problemStatement: str
    starterCode: str
    starterFunctionName: str
    examples: List[Example]
    testCode: Optional[str] = None

class AssignmentLoader:
    _instance = None
    _assignments = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AssignmentLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._assignments is None:
            self._load_assignments()

    def _load_assignments(self):
        """Load assignments from JSON file"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))
        config_path = os.path.join(project_root, 'config', 'assignment_configs.json')

        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
                self._assignments = {}
                
                for assignment_id, assignment_data in data.items():
                    # Convert examples to Example objects
                    examples = [
                        Example(
                            id=ex['id'],
                            inputText=ex['inputText'],
                            outputText=ex['outputText'],
                            explanation=ex['explanation']
                        ) 
                        for ex in assignment_data['examples']
                    ]

                    self._assignments[assignment_id] = Assignment(
                        id=assignment_data['id'],
                        title=assignment_data['title'],
                        problemStatement=assignment_data['problemStatement'],
                        starterCode=assignment_data['starterCode'],
                        starterFunctionName=assignment_data['starterFunctionName'],
                        examples=examples,
                        testCode=assignment_data.get('testCode')
                    )

        # print success message
            print(f"Assignments loaded successfully: {len(self._assignments)} assignments found")
        except Exception as e:
            print(f"Error loading assignment configs: {e}")
            self._assignments = {}

    def get_assignment(self, assignment_id: str) -> Optional[Assignment]:
        """Get an assignment by ID"""
        return self._assignments.get(assignment_id)

    def get_all_assignments(self) -> Dict[str, Assignment]:
        """Get all assignments"""
        return self._assignments

    def reload_assignments(self):
        """Force reload of assignments from JSON"""
        self._assignments = None
        self._load_assignments()

# Create a singleton instance
assignment_loader = AssignmentLoader()

# Helper functions
def get_assignment(assignment_id: str) -> Optional[Assignment]:
    return assignment_loader.get_assignment(assignment_id)

def get_all_assignments() -> Dict[str, Assignment]:
    return assignment_loader.get_all_assignments()