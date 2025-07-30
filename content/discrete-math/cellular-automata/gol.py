#!/usr/bin/env python3
"""
Optimized Conway's Game of Life - Python implementation
Performance optimizations:
- Only redraw changed cells
- Vectorized neighbor counting with NumPy
- Batch canvas updates
- Separate render and update timers
"""

import tkinter as tk
from tkinter import filedialog, messagebox
import numpy as np
import random
import json
import os
from collections import deque
from scipy import ndimage


class OptimizedGameOfLife:
    def __init__(self, master):
        self.master = master
        self.master.title("Conway's Game of Life (Optimized)")
        self.master.configure(bg='#333333')
        
        # Grid parameters
        self.cell_size = 4  # Smaller cells for better performance
        self.canvas_width = 800
        self.canvas_height = 600
        self.cols = self.canvas_width // self.cell_size
        self.rows = self.canvas_height // self.cell_size
        
        # Game state
        self.grid = np.zeros((self.cols, self.rows), dtype=np.int8)
        self.prev_grid = np.zeros((self.cols, self.rows), dtype=np.int8)
        self.running = False
        self.generations = 0
        self.population_history = deque(maxlen=5)
        self.frame_rate = 30  # Higher default frame rate
        self.initial_population = 0.09
        
        # Canvas objects cache
        self.cell_objects = {}
        
        # Timing
        self.last_update = 0
        self.update_interval = 1000 // self.frame_rate
        
        # Save/Load
        self.initial_state = None  # Store the starting configuration
        self.saves_dir = "saved_patterns"
        if not os.path.exists(self.saves_dir):
            os.makedirs(self.saves_dir)
        
        # Cycle detection
        self.state_history = deque(maxlen=1000)  # Store up to 1000 states
        self.seen_states = {}  # Map state -> generation when first seen
        self.cycle_detected = False
        self.cycle_length = 0
        self.cycle_start_gen = 0
        self.auto_pause_on_cycle = True  # Flag to control auto-pausing
        
        # Speed mode
        self.speed_mode = False
        self.max_generations = 100000
        
        self.setup_ui()
        self.reset_grid()
        self.update_loop()
    
    def setup_ui(self):
        # Control frame
        control_frame = tk.Frame(self.master, bg='#333333')
        control_frame.pack(pady=5)
        
        # Buttons
        self.toggle_btn = tk.Button(
            control_frame, text="Toggle Run", command=self.toggle_running,
            bg='#555555', fg='white', font=('Arial', 9)
        )
        self.toggle_btn.pack(side=tk.LEFT, padx=3)
        
        self.reset_btn = tk.Button(
            control_frame, text="Reset", command=self.reset_grid,
            bg='#555555', fg='white', font=('Arial', 9)
        )
        self.reset_btn.pack(side=tk.LEFT, padx=3)
        
        # Save/Load buttons
        self.save_btn = tk.Button(
            control_frame, text="Save", command=self.save_pattern,
            bg='#444444', fg='white', font=('Arial', 9)
        )
        self.save_btn.pack(side=tk.LEFT, padx=3)
        
        self.load_btn = tk.Button(
            control_frame, text="Load", command=self.load_pattern,
            bg='#444444', fg='white', font=('Arial', 9)
        )
        self.load_btn.pack(side=tk.LEFT, padx=3)
        
        # Save current state vs initial state
        self.save_current_btn = tk.Button(
            control_frame, text="Save Current", command=self.save_current_state,
            bg='#666666', fg='white', font=('Arial', 8)
        )
        self.save_current_btn.pack(side=tk.LEFT, padx=2)
        
        # Speed mode toggle
        self.speed_btn = tk.Button(
            control_frame, text="Speed Mode", command=self.toggle_speed_mode,
            bg='#800080', fg='white', font=('Arial', 9)
        )
        self.speed_btn.pack(side=tk.LEFT, padx=3)
        
        # Main container for canvas and stats
        main_frame = tk.Frame(self.master, bg='#333333')
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Canvas frame
        canvas_frame = tk.Frame(main_frame, bg='#333333')
        canvas_frame.pack(side=tk.LEFT, padx=5)
        
        # Canvas
        self.canvas = tk.Canvas(
            canvas_frame, width=self.canvas_width, height=self.canvas_height,
            bg='black', highlightthickness=1, highlightbackground='white'
        )
        self.canvas.pack()
        self.canvas.bind("<Button-1>", self.on_click)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        
        # Controls frame (right side)
        controls_frame = tk.Frame(main_frame, bg='#333333')
        controls_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=10, pady=5)
        
        # Sliders
        tk.Label(controls_frame, text="Initial Population:", 
                bg='#333333', fg='white', font=('Arial', 9)).pack(anchor='w')
        self.pop_slider = tk.Scale(
            controls_frame, from_=0, to=0.5, resolution=0.01, orient=tk.HORIZONTAL,
            bg='#555555', fg='white', font=('Arial', 8), length=180
        )
        self.pop_slider.set(self.initial_population)
        self.pop_slider.pack(pady=(0, 10))
        
        tk.Label(controls_frame, text="Frame Rate:", 
                bg='#333333', fg='white', font=('Arial', 9)).pack(anchor='w')
        self.rate_slider = tk.Scale(
            controls_frame, from_=1, to=60, orient=tk.HORIZONTAL,
            bg='#555555', fg='white', font=('Arial', 8), length=180,
            command=self.set_frame_rate
        )
        self.rate_slider.set(self.frame_rate)
        self.rate_slider.pack(pady=(0, 20))
        
        # Stats
        tk.Label(controls_frame, text="Statistics:", 
                bg='#333333', fg='white', font=('Arial', 10, 'bold')).pack(anchor='w', pady=(0, 5))
        
        self.stats_labels = {}
        stats = ['Running', 'Population', 'Rate Change', 'Generation', 'Cycle Status', 'Speed Mode']
        for stat in stats:
            label = tk.Label(controls_frame, text=f"{stat}: ", 
                           bg='#333333', fg='white', font=('Arial', 9), anchor='w')
            label.pack(anchor='w', pady=1)
            self.stats_labels[stat] = label
        
        # Performance stats
        self.stats_labels['FPS'] = tk.Label(controls_frame, text="FPS: 0", 
                                           bg='#333333', fg='#00FF00', font=('Arial', 9), anchor='w')
        self.stats_labels['FPS'].pack(anchor='w', pady=1)
        
        self.frame_times = deque(maxlen=30)
    
    def set_frame_rate(self, value):
        self.frame_rate = int(value)
        self.update_interval = 1000 // self.frame_rate
    
    def toggle_running(self):
        self.running = not self.running
        # Don't reset cycle detection, just disable auto-pause after first cycle
        if self.running and self.cycle_detected:
            self.auto_pause_on_cycle = False
    
    def toggle_speed_mode(self):
        """Toggle speed mode - runs at max speed until cycle or 100k generations"""
        self.speed_mode = not self.speed_mode
        
        if self.speed_mode:
            self.speed_btn.config(text="Stop Speed", bg='#FF4500')
            if not self.running:
                self.running = True
        else:
            self.speed_btn.config(text="Speed Mode", bg='#800080')
    
    def reset_grid(self):
        self.initial_population = self.pop_slider.get()
        self.grid.fill(0)
        
        # Clear canvas and cell objects cache
        self.canvas.delete("all")
        self.cell_objects.clear()
        
        # Populate grid randomly
        mask = np.random.random((self.cols, self.rows)) < self.initial_population
        self.grid[mask] = 1  # All cells are green
        
        self.prev_grid = self.grid.copy()
        self.initial_state = self.grid.copy()  # Save initial configuration
        self.update_population_history()
        self.generations = 0
        
        # Reset cycle detection
        self.state_history.clear()
        self.seen_states.clear()
        self.cycle_detected = False
        self.cycle_length = 0
        self.cycle_start_gen = 0
        self.auto_pause_on_cycle = True  # Re-enable auto-pause for new simulation
        
        # Reset speed mode
        if self.speed_mode:
            self.speed_mode = False
            self.speed_btn.config(text="Speed Mode", bg='#800080')
        
        self.draw_all_cells()
    
    def update_population_history(self):
        current_population = np.sum(self.grid > 0)
        self.population_history.append(current_population)
    
    def calculate_population_rate_change(self):
        if len(self.population_history) < 2:
            return 0
        
        changes = np.diff(self.population_history)
        return np.mean(changes)
    
    def on_click(self, event):
        self.toggle_cell(event)
    
    def on_drag(self, event):
        self.toggle_cell(event)
    
    def toggle_cell(self, event):
        x = event.x // self.cell_size
        y = event.y // self.cell_size
        
        if 0 <= x < self.cols and 0 <= y < self.rows:
            self.grid[x][y] = 1 if self.grid[x][y] == 0 else 0
            self.draw_cell(x, y)
            # Update initial state if we're at generation 0 (editing starting pattern)
            if self.generations == 0:
                self.initial_state = self.grid.copy()
    
    def count_neighbors_vectorized(self):
        """Vectorized neighbor counting using convolution"""
        # Create kernel for 8-connected neighbors
        kernel = np.array([[1, 1, 1],
                          [1, 0, 1], 
                          [1, 1, 1]], dtype=np.int8)
        
        # Count all neighbors (any non-zero cell)
        binary_grid = (self.grid > 0).astype(np.int8)
        neighbor_count = ndimage.convolve(binary_grid, kernel, mode='wrap')
        
        return neighbor_count
    
    
    def update_grid(self):
        if not self.running:
            return
        
        # Store previous state
        self.prev_grid = self.grid.copy()
        
        # Vectorized neighbor counting
        neighbor_count = self.count_neighbors_vectorized()
        
        # Apply Conway's rules vectorially
        # Birth: dead cell with exactly 3 neighbors
        birth_mask = (self.grid == 0) & (neighbor_count == 3)
        
        # Death: live cell with < 2 or > 3 neighbors
        death_mask = (self.grid > 0) & ((neighbor_count < 2) | (neighbor_count > 3))
        
        # Survival: live cell with 2 or 3 neighbors (no change needed)
        
        # Apply deaths
        self.grid[death_mask] = 0
        
        # Apply births - all new cells are green
        self.grid[birth_mask] = 1
        
        self.update_population_history()
        self.generations += 1
        
        # Check for cycles
        self.check_for_cycles()
        
        # Stop speed mode if conditions are met
        if self.speed_mode and (self.cycle_detected or self.generations >= self.max_generations):
            self.speed_mode = False
            self.speed_btn.config(text="Speed Mode", bg='#800080')
            self.running = False
    
    def check_for_cycles(self):
        """Detect repeating patterns in the grid state"""
        if self.cycle_detected:
            return
        
        # Convert current grid to a hashable format for comparison
        current_state = self.grid.tobytes()
        
        # Check if we've seen this state before
        if current_state in self.seen_states:
            # Found a cycle!
            first_occurrence = self.seen_states[current_state]
            self.cycle_detected = True
            self.cycle_length = self.generations - first_occurrence
            self.cycle_start_gen = first_occurrence
            # Only auto-pause if enabled and not in speed mode
            if self.auto_pause_on_cycle and not self.speed_mode:
                self.running = False
            return
        
        # Record this state
        self.seen_states[current_state] = self.generations
        self.state_history.append((self.generations, current_state))
        
        # Clean up old states if we're at capacity
        if len(self.state_history) > 950:  # Clean up when getting close to limit
            # Remove the oldest states from the seen_states dict
            old_gen, old_state = self.state_history[0]
            if old_state in self.seen_states and self.seen_states[old_state] == old_gen:
                del self.seen_states[old_state]
    
    def draw_cell(self, x, y):
        """Draw or update a single cell"""
        cell_key = (x, y)
        x1 = x * self.cell_size
        y1 = y * self.cell_size
        x2 = x1 + self.cell_size
        y2 = y1 + self.cell_size
        
        if self.grid[x][y] > 0:
            color = '#00FF00'  # All cells are green
            if cell_key in self.cell_objects:
                self.canvas.itemconfig(self.cell_objects[cell_key], fill=color)
            else:
                obj = self.canvas.create_rectangle(x1, y1, x2, y2, 
                                                 fill=color, outline='')
                self.cell_objects[cell_key] = obj
        else:
            if cell_key in self.cell_objects:
                self.canvas.delete(self.cell_objects[cell_key])
                del self.cell_objects[cell_key]
    
    def draw_all_cells(self):
        """Initial draw of all cells"""
        for x in range(self.cols):
            for y in range(self.rows):
                if self.grid[x][y] > 0:
                    self.draw_cell(x, y)
    
    def draw_changed_cells(self):
        """Only redraw cells that changed"""
        changed = self.grid != self.prev_grid
        changed_coords = np.where(changed)
        
        for x, y in zip(changed_coords[0], changed_coords[1]):
            self.draw_cell(x, y)
    
    def update_stats(self):
        """Update statistics display"""
        populated_count = np.sum(self.grid > 0)
        total_cells = self.cols * self.rows
        population_percent = (populated_count / total_cells) * 100
        rate_change = self.calculate_population_rate_change()
        
        # Calculate FPS
        current_time = self.master.tk.call('clock', 'milliseconds')
        self.frame_times.append(current_time)
        if len(self.frame_times) > 1:
            fps = 1000 * (len(self.frame_times) - 1) / (self.frame_times[-1] - self.frame_times[0])
        else:
            fps = 0
        
        # Cycle status
        if self.cycle_detected:
            cycle_status = f"Cycle {self.cycle_length} (gen {self.cycle_start_gen})"
            cycle_color = '#FFD700'  # Gold color for cycle detection
        else:
            cycle_status = "None"
            cycle_color = '#FFFFFF'
        
        # Speed mode status
        speed_status = "ON" if self.speed_mode else "OFF"
        speed_color = '#FF4500' if self.speed_mode else '#FFFFFF'
        
        stats_data = {
            'Running': "Yes" if self.running else "No",
            'Population': f"{population_percent:.1f}%",
            'Rate Change': f"{rate_change:.1f}",
            'Generation': str(self.generations),
            'Cycle Status': cycle_status,
            'Speed Mode': speed_status,
            'FPS': f"{fps:.1f}"
        }
        
        # Update colors for cycle status and speed mode
        colors = {
            'Cycle Status': cycle_color,
            'Speed Mode': speed_color
        }
        
        for stat, value in stats_data.items():
            color = colors.get(stat, '#FFFFFF')
            self.stats_labels[stat].config(text=f"{stat}: {value}", fg=color)
    
    def update_loop(self):
        current_time = self.master.tk.call('clock', 'milliseconds')
        
        if self.speed_mode and self.running:
            # Speed mode: run as fast as possible until done
            generations_per_batch = 5000  # Process many generations at once
            for _ in range(generations_per_batch):
                if not self.running or self.cycle_detected or self.generations >= self.max_generations:
                    break
                # Update grid logic only, no drawing
                if not self.running:
                    return
                
                # Store previous state
                self.prev_grid = self.grid.copy()
                
                # Vectorized neighbor counting
                neighbor_count = self.count_neighbors_vectorized()
                
                # Apply Conway's rules vectorially
                birth_mask = (self.grid == 0) & (neighbor_count == 3)
                death_mask = (self.grid > 0) & ((neighbor_count < 2) | (neighbor_count > 3))
                
                # Apply deaths and births
                self.grid[death_mask] = 0
                self.grid[birth_mask] = 1
                
                self.update_population_history()
                self.generations += 1
                
                # Check for cycles (simplified for speed)
                self.check_for_cycles()
                
                # Stop speed mode if conditions are met
                if self.cycle_detected or self.generations >= self.max_generations:
                    self.speed_mode = False
                    self.speed_btn.config(text="Speed Mode", bg='#800080')
                    self.running = False
                    # Force complete redraw when speed mode ends
                    self.canvas.delete("all")
                    self.cell_objects.clear()
                    self.draw_all_cells()
                    break
            
            # Update display and stats (only when done or periodically)
            if not self.speed_mode or self.generations % 5000 == 0:
                self.draw_changed_cells()
            self.update_stats()
            
        else:
            # Normal mode: update at specified frame rate
            if current_time - self.last_update >= self.update_interval:
                self.update_grid()
                self.draw_changed_cells()
                self.last_update = current_time
            
            # Update stats and UI less frequently (every 100ms)
            if current_time % 100 < 20:  # Approximate every 100ms
                self.update_stats()
        
        # Schedule next update
        if self.speed_mode and self.running:
            self.master.after(1, self.update_loop)  # Immediate in speed mode
        else:
            self.master.after(16, self.update_loop)  # ~60 FPS UI updates normally
    
    def save_pattern(self):
        """Save the initial configuration to a file"""
        if self.initial_state is None:
            messagebox.showwarning("No Pattern", "No initial pattern to save. Reset first to create a pattern.")
            return
        
        filename = filedialog.asksaveasfilename(
            title="Save Pattern",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialdir=self.saves_dir
        )
        
        if filename:
            try:
                # Convert numpy array to list for JSON serialization
                pattern_data = {
                    "pattern": self.initial_state.tolist(),
                    "cols": self.cols,
                    "rows": self.rows,
                    "cell_size": self.cell_size,
                    "initial_population": self.initial_population,
                    "description": f"Pattern saved with {np.sum(self.initial_state > 0)} live cells"
                }
                
                with open(filename, 'w') as f:
                    json.dump(pattern_data, f, indent=2)
                
                messagebox.showinfo("Saved", f"Pattern saved to {os.path.basename(filename)}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save pattern: {str(e)}")
    
    def save_current_state(self):
        """Save the current state of the grid"""
        filename = filedialog.asksaveasfilename(
            title="Save Current State",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialdir=self.saves_dir
        )
        
        if filename:
            try:
                # Convert numpy array to list for JSON serialization
                pattern_data = {
                    "pattern": self.grid.tolist(),
                    "cols": self.cols,
                    "rows": self.rows,
                    "cell_size": self.cell_size,
                    "initial_population": self.initial_population,
                    "generation": self.generations,
                    "description": f"State saved at generation {self.generations} with {np.sum(self.grid > 0)} live cells"
                }
                
                with open(filename, 'w') as f:
                    json.dump(pattern_data, f, indent=2)
                
                messagebox.showinfo("Saved", f"Current state saved to {os.path.basename(filename)}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save current state: {str(e)}")
    
    def load_pattern(self):
        """Load a pattern from a file"""
        filename = filedialog.askopenfilename(
            title="Load Pattern",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialdir=self.saves_dir
        )
        
        if filename:
            try:
                with open(filename, 'r') as f:
                    pattern_data = json.load(f)
                
                # Validate the loaded data
                if "pattern" not in pattern_data:
                    messagebox.showerror("Error", "Invalid pattern file: missing pattern data")
                    return
                
                loaded_pattern = np.array(pattern_data["pattern"], dtype=np.int8)
                loaded_cols, loaded_rows = loaded_pattern.shape
                
                # Check if dimensions match current grid
                if loaded_cols != self.cols or loaded_rows != self.rows:
                    response = messagebox.askyesno(
                        "Dimension Mismatch", 
                        f"Pattern dimensions ({loaded_cols}x{loaded_rows}) don't match current grid ({self.cols}x{self.rows}). "
                        f"Load anyway? Pattern may be cropped or padded."
                    )
                    if not response:
                        return
                
                # Stop simulation and clear grid
                self.running = False
                self.grid.fill(0)
                self.canvas.delete("all")
                self.cell_objects.clear()
                
                # Load pattern, handling dimension differences
                min_cols = min(loaded_cols, self.cols)
                min_rows = min(loaded_rows, self.rows)
                self.grid[:min_cols, :min_rows] = loaded_pattern[:min_cols, :min_rows]
                
                # Update states
                self.prev_grid = self.grid.copy()
                self.initial_state = self.grid.copy()
                self.generations = 0
                self.population_history.clear()
                self.update_population_history()
                
                # Reset cycle detection
                self.state_history.clear()
                self.seen_states.clear()
                self.cycle_detected = False
                self.cycle_length = 0
                self.cycle_start_gen = 0
                self.auto_pause_on_cycle = True  # Re-enable auto-pause for loaded pattern
                
                # Update UI
                if "initial_population" in pattern_data:
                    self.pop_slider.set(pattern_data["initial_population"])
                
                self.draw_all_cells()
                
                description = pattern_data.get("description", "Loaded pattern")
                messagebox.showinfo("Loaded", f"Pattern loaded successfully!\n{description}")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load pattern: {str(e)}")


def main():
    import sys
    
    try:
        import scipy
    except ImportError:
        print("Installing scipy for optimized performance...")
        import subprocess
        subprocess.check_call(["pip", "install", "scipy"])
        import scipy
    
    # Check for test mode
    test_mode = "--test" in sys.argv
    
    root = tk.Tk()
    root.resizable(False, False)
    game = OptimizedGameOfLife(root)
    
    if test_mode:
        print("Running in test mode...")
        # Auto-start the simulation
        game.running = True
        
        # Schedule auto-exit after 3 seconds
        def auto_exit():
            print(f"Test completed. Ran {game.generations} generations.")
            if game.cycle_detected:
                print(f"Cycle detected: length {game.cycle_length} starting at generation {game.cycle_start_gen}")
            root.quit()
            root.destroy()
        
        root.after(3000, auto_exit)  # Exit after 3 seconds
    
    root.mainloop()


if __name__ == "__main__":
    main()