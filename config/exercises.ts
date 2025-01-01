// types/exercise.ts
import { Exercise } from '@/types/utils'

export type ExerciseCollection = {
  [key: string]: Exercise;
};

// config/exercises.ts
export const EXERCISES: ExerciseCollection = {
  auraPts: {
    id: 'aura-points-calculator',
    title: 'Aura Points Calculator',
    description:
      'Create the system to track and calculate character energy levels!',
    date: 1234567890,
    theme: 'gaming-universe',
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    tags: ['python', 'gaming', 'beginner', 'calculator'],
    image: 'https://picsum.photos/id/236/200',
    published: true,
    starterCode: `class Character:
    def __init__(self, name, base_aura=100):
        # TODO: Initialize the character attributes here
        pass

    def add_buff(self, name, power_increase):
        # TODO: Implement buff addition
        pass

    def add_debuff(self, name, power_decrease):
        # TODO: Implement debuff addition
        pass

    def calculate_current_aura(self):
        # TODO: Calculate total aura points
        pass

    def display_status(self):
        # TODO: Print character status
        pass

    def show_aura_bar(self, width=50):
        # TODO: Display visual aura bar
        pass`,
    testCode: `
def capture_output(func, *args, **kwargs):
    import io
    import sys
    output = io.StringIO()
    sys.stdout = output
    func(*args, **kwargs)
    sys.stdout = sys.__stdout__
    return output.getvalue()

def test_character():
    try:
        print("🧪 Starting Aura Points Calculator Tests...\\n")
        
        # Test 1: Basic Initialization
        print("Test 1: Basic Initialization")
        hero = Character("Test Hero")
        assert hero.name == "Test Hero", "❌ Character name not set correctly"
        assert hero.base_aura == 100, "❌ Base aura not initialized to default value"
        assert hero.current_aura == 100, "❌ Current aura not initialized correctly"
        print("✅ Basic initialization passed!\\n")

        # Test 2: Adding Buffs
        print("Test 2: Adding Buffs")
        hero.add_buff("Training", 20)
        assert hero.current_aura == 120, "❌ Buff not applied correctly"
        hero.add_buff("Magic Crystal", 15)
        assert hero.current_aura == 135, "❌ Multiple buffs not stacking correctly"
        print("✅ Buff system working correctly!\\n")

        # Test 3: Adding Debuffs
        print("Test 3: Adding Debuffs")
        hero.add_debuff("Exhaustion", 10)
        assert hero.current_aura == 125, "❌ Debuff not applied correctly"
        print("✅ Debuff system working correctly!\\n")

        # Test 4: Status Display
        print("Test 4: Status Display")
        expected_display = """Character Status: Test Hero\n==============================\nBase Aura: 100\nCurrent Aura: 125\nActive Buffs:\n- Training: +20\n- Magic Crystal: +15\nActive Debuffs:\n- Exhaustion: -10"""
        actual_display = capture_output(hero.display_status).strip()
        assert actual_display == expected_display, "❌ Status display format incorrect"
        print("✅ Status display formatting correct!\\n")

        # Test 5: Aura Bar Display
        print("Test 5: Aura Bar")
        expected_bar = """Aura Level: 125/100\n[████████████████████████████████████████] 125.0%"""
        actual_bar = capture_output(lambda: hero.show_aura_bar(40)).strip()
        assert actual_bar == expected_bar, "❌ Aura bar visualization incorrect"
        print("✅ Aura bar visualization correct!\\n")

        # Final Success Message
        print("🎉 All tests passed! Great work!")
        return True

    except AssertionError as e:
        print(f"\\n❌ Test failed: {str(e)}")
        return False
    except Exception as e:
        print(f"\\n❌ Error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_character()`,
    solution: `class Character:
    def __init__(self, name, base_aura=100):
        self.name = name
        self.base_aura = base_aura
        self.current_aura = base_aura
        self.buffs = []
        self.debuffs = []
    
    def add_buff(self, name, power_increase):
        """Add a power-up buff to the character"""
        self.buffs.append({"name": name, "power": power_increase})
        self.calculate_current_aura()
    
    def add_debuff(self, name, power_decrease):
        """Add a power-down debuff to the character"""
        self.debuffs.append({"name": name, "power": power_decrease})
        self.calculate_current_aura()
    
    def calculate_current_aura(self):
        """Calculate total aura points including buffs and debuffs"""
        total = self.base_aura
        
        # Add all buff effects
        for buff in self.buffs:
            total += buff["power"]
            
        # Subtract all debuff effects
        for debuff in self.debuffs:
            total -= debuff["power"]
        
        # Ensure aura doesn't go below 0
        self.current_aura = max(0, total)
        return self.current_aura
    
    def display_status(self):
        """Display character's current status"""
        status = [
            f"Character Status: {self.name}",
            "=" * 30,
            f"Base Aura: {self.base_aura}",
            f"Current Aura: {self.current_aura}"
        ]
        
        # Add buffs if any exist
        if self.buffs:
            status.append("Active Buffs:")
            for buff in self.buffs:
                status.append(f"- {buff['name']}: +{buff['power']}")
        
        # Add debuffs if any exist
        if self.debuffs:
            status.append("Active Debuffs:")
            for debuff in self.debuffs:
                status.append(f"- {debuff['name']}: -{debuff['power']}")
        
        # Join all lines with newlines and print
        print("\n".join(status))
    
    def show_aura_bar(self, width=50):
        """Display a visual representation of the aura level"""
        percentage = self.current_aura / self.base_aura
        filled_length = int(width * percentage)
        filled_length = min(width, filled_length)  # Ensure we don't exceed width
        bar = '█' * filled_length + '░' * (width - filled_length)
        
        # Create the exact format expected by the test
        output = [
            f"Aura Level: {self.current_aura}/{self.base_aura}",
            f"[{bar}] {percentage:.1%}"
        ]
        print("\n".join(output))`,
  },
  petCompanion: {
    id: 'virtual-pet-companion',
    title: 'Virtual Pet Companion',
    description:
      'Create a fun and educational virtual pet system that simulates pet care and animal facts!',
    date: 1234567890,
    theme: 'pet-companion',
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    tags: ['python', 'pets', 'beginner', 'simulator'],
    image: 'https://picsum.photos/id/237/200',
    published: true,
    starterCode: `class Pet:
    def __init__(self, name, species):
        # TODO: Initialize pet attributes
        pass
        
    def feed(self, food_amount):
        # TODO: Implement feeding mechanics
        pass
    
    def play(self, play_time):
        # TODO: Implement play mechanics
        pass
    
    def rest(self, rest_time):
        # TODO: Implement rest mechanics
        pass
    
    def get_status(self):
        # TODO: Return pet status
        pass

class AnimalEncyclopedia:
    def __init__(self):
        # TODO: Initialize encyclopedia
        pass
    
    def add_species(self, species, facts):
        # TODO: Add new species
        pass
    
    def get_species_info(self, species):
        # TODO: Get species information
        pass`,
    testCode: `
def test_pet_companion():
    try:
        print("🐾 Starting Virtual Pet Tests...\\n")
        
        # Test 1: Pet Creation
        print("Test 1: Pet Creation")
        pet = Pet("Buddy", "dog")
        assert hasattr(pet, 'name'), "❌ Pet name not initialized"
        assert hasattr(pet, 'species'), "❌ Pet species not initialized"
        assert hasattr(pet, 'hunger'), "❌ Pet hunger not initialized"
        assert hasattr(pet, 'happiness'), "❌ Pet happiness not initialized"
        assert hasattr(pet, 'energy'), "❌ Pet energy not initialized"
        print("✅ Pet creation successful!\\n")

        # Test 2: Feeding System
        print("Test 2: Feeding System")
        initial_hunger = pet.hunger
        pet.feed(30)
        assert pet.hunger < initial_hunger, "❌ Feeding not decreasing hunger"
        assert pet.hunger >= 0, "❌ Hunger went below 0"
        assert pet.hunger <= 100, "❌ Hunger exceeded 100"
        print("✅ Feeding system working!\\n")

        # Test 3: Play System
        print("Test 3: Play System")
        initial_energy = pet.energy
        initial_happiness = pet.happiness
        pet.play(20)
        assert pet.energy < initial_energy, "❌ Playing not decreasing energy"
        assert pet.happiness > initial_happiness, "❌ Playing not increasing happiness"
        print("✅ Play system working!\\n")

        # Test 4: Rest System
        print("Test 4: Rest System")
        initial_energy = pet.energy
        pet.rest(30)
        assert pet.energy > initial_energy, "❌ Rest not increasing energy"
        assert pet.energy <= 100, "❌ Energy exceeded maximum"
        print("✅ Rest system working!\\n")

        # Test 5: Encyclopedia
        print("Test 5: Encyclopedia")
        encyclopedia = AnimalEncyclopedia()
        test_facts = {
            "diet": ["omnivore"],
            "lifespan": "10-13 years",
            "habitat": "domestic"
        }
        encyclopedia.add_species("dog", test_facts)
        info = encyclopedia.get_species_info("dog")
        assert info == test_facts, "❌ Encyclopedia not storing/retrieving data correctly"
        print("✅ Encyclopedia working!\\n")

        # Final Success Message
        print("🎉 All tests passed! Your virtual pet is ready for action!")
        return True

    except AssertionError as e:
        print(f"\\n❌ Test failed: {str(e)}")
        return False
    except Exception as e:
        print(f"\\n❌ Error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_pet_companion()`,
    solution: `class Pet:
    def __init__(self, name, species):
        """Initialize a new pet with default status values"""
        self.name = name
        self.species = species
        self.hunger = 50  # Start at 50% hunger
        self.happiness = 75  # Start fairly happy
        self.energy = 100  # Start with full energy
        self.last_meal_time = None
        
    def feed(self, food_amount):
        """Feed the pet to reduce hunger and increase happiness"""
        if not 0 <= food_amount <= 100:
            raise ValueError("Food amount must be between 0 and 100")
            
        # Calculate hunger reduction (more food = more hunger reduction)
        hunger_reduction = min(food_amount / 2, self.hunger)
        self.hunger = max(0, self.hunger - hunger_reduction)
        
        # Being fed makes pet happy
        happiness_boost = food_amount / 4
        self.happiness = min(100, self.happiness + happiness_boost)
        
        return {
            "message": f"{self.name} has been fed!",
            "hunger_reduced": hunger_reduction,
            "happiness_gained": happiness_boost
        }
    
    def play(self, play_time):
        """Play with pet to increase happiness but consume energy"""
        if not 0 <= play_time <= 60:  # Limit play sessions to 1 hour
            raise ValueError("Play time must be between 0 and 60 minutes")
            
        # Playing consumes energy
        energy_cost = play_time / 2
        if self.energy < energy_cost:
            return {"message": f"{self.name} is too tired to play!"}
            
        self.energy = max(0, self.energy - energy_cost)
        
        # Playing makes pet happy but also hungry
        happiness_boost = play_time
        hunger_increase = play_time / 3
        
        self.happiness = min(100, self.happiness + happiness_boost)
        self.hunger = min(100, self.hunger + hunger_increase)
        
        return {
            "message": f"{self.name} had fun playing!",
            "energy_spent": energy_cost,
            "happiness_gained": happiness_boost,
            "hunger_increased": hunger_increase
        }
    
    def rest(self, rest_time):
        """Let pet rest to recover energy"""
        if not 0 <= rest_time <= 480:  # Max 8 hours of rest
            raise ValueError("Rest time must be between 0 and 480 minutes")
            
        # Calculate energy recovery
        energy_recovery = rest_time / 4
        self.energy = min(100, self.energy + energy_recovery)
        
        # Resting makes pet slightly less happy but reduces hunger slightly
        happiness_reduction = rest_time / 8
        self.happiness = max(0, self.happiness - happiness_reduction)
        
        return {
            "message": f"{self.name} took a nice rest!",
            "energy_recovered": energy_recovery,
            "happiness_reduced": happiness_reduction
        }
    
    def get_status(self):
        """Return current pet status"""
        status_levels = {
            "0-20": "Critical",
            "21-40": "Low",
            "41-60": "Moderate",
            "61-80": "Good",
            "81-100": "Excellent"
        }
        
        def get_level(value):
            for range_str, level in status_levels.items():
                start, end = map(int, range_str.split("-"))
                if start <= value <= end:
                    return level
            return "Unknown"
            
        return {
            "name": self.name,
            "species": self.species,
            "hunger": {
                "value": self.hunger,
                "level": get_level(self.hunger)
            },
            "happiness": {
                "value": self.happiness,
                "level": get_level(self.happiness)
            },
            "energy": {
                "value": self.energy,
                "level": get_level(self.energy)
            }
        }


class AnimalEncyclopedia:
    def __init__(self):
        """Initialize encyclopedia with basic species information"""
        self.species_data = {
            "dog": {
                "diet": ["omnivore"],
                "lifespan": "10-13 years",
                "habitat": "domestic",
                "care_tips": [
                    "Regular exercise needed",
                    "Social interaction important",
                    "Regular vet check-ups"
                ]
            },
            "cat": {
                "diet": ["carnivore"],
                "lifespan": "12-18 years",
                "habitat": "domestic",
                "care_tips": [
                    "Clean litter box daily",
                    "Provide scratching posts",
                    "Regular grooming"
                ]
            }
        }
    
    def add_species(self, species, facts):
        """Add or update species information"""
        if not isinstance(facts, dict):
            raise ValueError("Facts must be provided as a dictionary")
            
        required_keys = {"diet", "lifespan", "habitat"}
        if not all(key in facts for key in required_keys):
            raise ValueError(f"Facts must include all required information: {required_keys}")
            
        self.species_data[species.lower()] = facts
        return {"message": f"Added/updated information for {species}"}
    
    def get_species_info(self, species):
        """Retrieve information about a species"""
        species = species.lower()
        if species not in self.species_data:
            raise KeyError(f"No information available for {species}")
            
        return self.species_data[species]
    
    def get_all_species(self):
        """Get list of all species in encyclopedia"""
        return list(self.species_data.keys())
    
    def get_care_tips(self, species):
        """Get specific care tips for a species"""
        species = species.lower()
        if species not in self.species_data:
            raise KeyError(f"No information available for {species}")
            
        return self.species_data[species].get("care_tips", [])


# Example usage:
if __name__ == "__main__":
    # Create a pet
    buddy = Pet("Buddy", "dog")
    
    # Create encyclopedia
    encyclopedia = AnimalEncyclopedia()
    
    # Example interactions
    print("Initial Status:", buddy.get_status())
    
    buddy.feed(30)
    buddy.play(15)
    buddy.rest(60)
    
    print("Final Status:", buddy.get_status())
    
    # Get species information
    print("\nDog Care Tips:", encyclopedia.get_care_tips("dog"))`,
  },
}
