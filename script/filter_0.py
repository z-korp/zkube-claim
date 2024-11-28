import pandas as pd
from pathlib import Path

def remove_addresses(input_folder):
    """
    Remove addresses starting with '0x0' and '0x1' from all CSVs in the folder
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
            
            # Count original rows
            original_count = len(df)
            
            # Remove addresses starting with '0x0' or '0x1'
            df = df[~df['address'].str.startswith(('0x0', '0x1'))]
            
            # Count removed rows
            removed_count = original_count - len(df)
            
            # Save back to CSV with original name
            df.to_csv(file, index=False)
            
            print(f"\nProcessed {file.name}")
            print(f"Original rows: {original_count}")
            print(f"Rows after removal: {len(df)}")
            print(f"Removed {removed_count} addresses")
            
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")
    
    print(f"\nProcessed {len(csv_files)} files")

# Example usage
if __name__ == "__main__":
    input_folder = "./distribution/controllers/"  # Replace with your folder path
    remove_addresses(input_folder)