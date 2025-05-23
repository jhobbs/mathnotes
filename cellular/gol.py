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
import numpy as np
import random
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
        stats = ['Running', 'Population', 'Rate Change', 'Generation', 'FPS']
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
        self.update_population_history()
        self.generations = 0
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
        
        stats_data = {
            'Running': "Yes" if self.running else "No",
            'Population': f"{population_percent:.1f}%",
            'Rate Change': f"{rate_change:.1f}",
            'Generation': str(self.generations),
            'FPS': f"{fps:.1f}"
        }
        
        for stat, value in stats_data.items():
            self.stats_labels[stat].config(text=f"{stat}: {value}")
    
    def update_loop(self):
        current_time = self.master.tk.call('clock', 'milliseconds')
        
        # Update game state at specified frame rate
        if current_time - self.last_update >= self.update_interval:
            self.update_grid()
            self.draw_changed_cells()
            self.last_update = current_time
        
        # Update stats and UI less frequently (every 100ms)
        if current_time % 100 < 20:  # Approximate every 100ms
            self.update_stats()
        
        # Schedule next update (faster polling for smooth interaction)
        self.master.after(16, self.update_loop)  # ~60 FPS UI updates


def main():
    try:
        import scipy
    except ImportError:
        print("Installing scipy for optimized performance...")
        import subprocess
        subprocess.check_call(["pip", "install", "scipy"])
        import scipy
    
    root = tk.Tk()
    root.resizable(False, False)
    game = OptimizedGameOfLife(root)
    root.mainloop()


if __name__ == "__main__":
    main()