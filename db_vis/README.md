# Database Visualization Tool

This tool helps you visualize and explore your Supabase PostgreSQL database with interactive charts and comprehensive analysis.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Quick Exploration

For a quick overview of your database:

```bash
python quick_explore.py
```

This will:
- List all tables in your database
- Show column structure for each table
- Display sample data
- Create basic visualizations for the 'market_ai_reasoning' table

### 3. Run Full Visualization Suite

For comprehensive analysis with interactive dashboards:

```bash
python db_visualizer.py
```

This provides:
- Database overview with table statistics
- Detailed analysis of the 'market_ai_reasoning' table
- Interactive charts and correlation matrices
- Custom visualization options

## 📊 Features

### Quick Explorer (`quick_explore.py`)
- **Database Schema Discovery**: Automatically finds all tables and their structure
- **Data Sampling**: Shows sample records from each table
- **Basic Statistics**: Row counts, data types, null values
- **Simple Visualizations**: Histograms and bar charts for key columns

### Full Visualizer (`db_visualizer.py`)
- **Comprehensive Analysis**: Multi-panel dashboards
- **Interactive Charts**: Plotly-based visualizations
- **Correlation Analysis**: For numeric columns
- **Custom Visualizations**: Create specific charts for any table
- **Data Quality Insights**: Null value analysis, data type distribution

## 🔧 Configuration

The database connection is configured for your Supabase instance:
- **Host**: `db.yhtslnjjprjazoruofdo.supabase.co`
- **Database**: `postgres`
- **User**: `postgres`

## 📈 Usage Examples

### Explore a Specific Table
```python
from db_visualizer import DatabaseVisualizer

visualizer = DatabaseVisualizer()
visualizer.connect()

# Custom visualization
visualizer.create_custom_visualization('market_ai_reasoning', 'column1', 'column2', 'scatter')
```

### Get Table Information
```python
# Get column details
table_info = visualizer.get_table_info('market_ai_reasoning')
print(table_info)

# Get sample data
data = visualizer.get_table_data('market_ai_reasoning', limit=100)
```

## 🎯 Focused on 'market_ai_reasoning' Table

Both scripts include special handling for the 'market_ai_reasoning' table:
- Detailed column analysis
- Data quality assessment
- Automatic visualization generation
- Sample data display

## 📋 Requirements

- Python 3.7+
- PostgreSQL access
- Internet connection for Plotly visualizations

## 🛠️ Troubleshooting

### Connection Issues
- Verify your internet connection
- Check if the Supabase instance is accessible
- Ensure the database credentials are correct

### Missing Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Visualization Not Showing
- Install kaleido for static image export: `pip install kaleido`
- For Jupyter notebooks, install: `pip install jupyter-dash`

## 🔍 What You'll See

1. **Database Overview**: All tables and their sizes
2. **Table Structure**: Column names, types, and constraints
3. **Data Quality**: Null values, data distribution
4. **Sample Data**: First few rows of each table
5. **Interactive Charts**: Based on your data patterns

## 🌐 Web Interface

Your React app now has a `/settled` endpoint that fetches and displays data from the `market_ai_reasoning` table:
- Navigate to `http://localhost:3000/settled` in your React app
- Data will be console logged and displayed on the page
- Perfect for seeing the actual structure of your data

Run the scripts and explore your database structure to understand what data you're working with!
