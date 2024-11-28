import pandas as pd
from pathlib import Path

def update_timestamps(input_folder, new_timestamp):
    """
    Update expiration_timestamp in all CSVs in the folder
    
    Args:
    input_folder (str): Path to folder containing CSV files
    new_timestamp (int): New timestamp value to set
    """
    folder = Path(input_folder)
    csv_files = list(folder.glob('*.csv'))
    
    if not csv_files:
        print(f"No CSV files found in {input_folder}")
        return
        
    for file in csv_files:
        try:
            # Read CSV
            df = pd.read_csv(file)
            
            # Update timestamp
            df['expiration_timestamp'] = new_timestamp
            
            # Save back to CSV with original name
            df.to_csv(file, index=False)
            print(f"Updated {file.name}")
            
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")
    
    print(f"\nProcessed {len(csv_files)} files")

# Example usage
if __name__ == "__main__":
    input_folder = "./distribution/controllers/"  # Replace with your folder path
    new_timestamp = 1732804701758#1733493600  # Replace with your desired timestamp
    update_timestamps(input_folder, new_timestamp)