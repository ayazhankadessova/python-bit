### Tutorial 3, Exercise 2:

```
# Your mission: Add some delicious fruits: "apple", "banana", "orange"
fruit_basket = []
fruit_basket.append("apple")
fruit_basket.append("banana")
fruit_basket.append("orange")
print(fruit_basket)
```
### Exercise 4:
```
# Your mission: Create a secret geocache location!

geocache_location = (37.7749, -122.4194, 10)

print("Latitude:", geocache_location[0])
print("Full Location:", geocache_location)
```
### Exercise 6:

### Exercise 6

```
# Adventure game inventory
game_inventory = {
  "health_potion": 5,
  "magic_scroll": 3,
  "golden_key": 1
}

# Add more of a specific item
game_inventory["health_potion"] += 2

# Print total items and specific item details
print("Full Inventory:", game_inventory)
print("Health Potions:", game_inventory["health_potion"])
```

### Exercise 8:

```
# Create a set of unique battle royale weapons

battle_loadout = set()  

battle_loadout.add("assault rifle")  # Won't create a duplicate!

# Add a new weapon
battle_loadout.add("shotgun")
battle_loadout.add("sniper")

# Remove a weapon

# Print loadout details
print("Total Unique Weapons:", len(battle_loadout))

```

### Exercise 9:

```
# 1. Weapons Arsenal
weapons = ["sword", "bow", "magic staff", "throwing axe", "crossbow"]

# 2. Character Classes (unchanged)  
character_classes = ("warrior", "archer", "mage")

# 3. Character Creation
my_character = {
    "name": "DragonSlayer99",
    "class": "warrior", 
    "inventory": weapons,
    "level": 1
}

# 4. Achievements
achievements = {"beginner", "monster_slayer", "treasure_hunter", "epic_quest_complete", "boss_defeated"}

# Print profile
print("=== PLAYER PROFILE ===")
print("Name:", my_character["name"])
print("Class:", my_character["class"])
print("Weapons:", my_character["inventory"])
print("Total Achievements:", len(achievements))
```
## Exercise 10

```
# Make this code correct!
my_tuple = (1, 2, 3)
# my_tuple[0] = 5 # Can we change tuple values? 🤔
player_stats = {"health": 100, "health": 200} # Duplicate keys? 🤔
my_set = {"red", "blue", "red", "green"} # Duplicate values? 🤔

print("Tuple:", my_tuple)
print("Player Stats:", player_stats)
print("Length of my set:", len(my_set))
```
### Aura points

```
class Character:
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
        print("\n".join(output))
```