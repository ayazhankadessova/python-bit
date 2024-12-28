// types/exercise.ts
import { Exercise } from '@/types/utils'

export type ExerciseCollection = {
  [key: string]: Exercise;
};

// config/exercises.ts
export const EXERCISES: ExerciseCollection = {
  auraPts: {
    id: 'aura-points',
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
}
