import os
import pandas as pd
from pathlib import Path

def count_unique_addresses(folder_path):
    """
    Read all CSV files in the specified folder and count unique addresses
    with detailed information about overlap.
    
    Parameters:
    folder_path (str): Path to the folder containing CSV files
    
    Returns:
    tuple: (number of unique addresses, set of unique addresses)
    """
    folder = Path(folder_path)
    
    # Dictionary to store addresses by file
    addresses_by_file = {}
    
    # Set to store all unique addresses across all files
    all_addresses = set()
    
    # First pass: collect addresses from each file
    for file in folder.glob('*.csv'):
        try:
            df = pd.read_csv(file, usecols=['address'])
            file_addresses = set(df['address'].unique())
            
            addresses_by_file[file.stem] = file_addresses
            all_addresses.update(file_addresses)
            
            print(f"Processed {file.name}: Found {len(file_addresses)} unique addresses")
            
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")
    
    # Calculate overlap statistics
    print("\nOverlap Analysis:")
    for file1, addresses1 in addresses_by_file.items():
        for file2, addresses2 in addresses_by_file.items():
            if file1 < file2:  # Avoid comparing a file with itself and duplicate comparisons
                overlap = len(addresses1.intersection(addresses2))
                if overlap > 0:
                    print(f"{file1} and {file2} share {overlap} addresses")
    
    total_individual = sum(len(addrs) for addrs in addresses_by_file.values())
    print(f"\nSum of individual file unique addresses: {total_individual}")
    print(f"Total unique addresses across all files: {len(all_addresses)}")
    print(f"Difference (overlap): {total_individual - len(all_addresses)}")
    
    return len(all_addresses), all_addresses

# Example usage
if __name__ == "__main__":
    folder_path = "./output/all/all_braavos_argent"
    count, addresses = count_unique_addresses(folder_path)