import pandas as pd
from pathlib import Path

def merge_csvs(input_folder):
    """
    Merge multiple CSVs and standardize the format:
    - Set quantity to 2
    - Keep original collection
    - Set fixed expiration timestamp
    """
    # Get all CSV files in the folder
    csv_files = list(Path(input_folder).glob('*.csv'))
    
    if not csv_files:
        print(f"No CSV files found in {input_folder}")
        return
    
    # List to store all dataframes
    all_dfs = []
    
    for file in csv_files:
        try:
            # Read CSV
            df = pd.read_csv(file)
            
            # Standardize the dataframe
            new_df = pd.DataFrame({
                'address': df['address'],
                'quantity': 2,  # Fixed quantity
                'collection': df['collection'],  # Keep original collection
                'expiration_timestamp': 1733656248  # Fixed timestamp
            })
            
            all_dfs.append(new_df)
            print(f"Processed {file.name} - {len(new_df)} addresses")
            
        except Exception as e:
            print(f"Error processing {file.name}: {str(e)}")
    
    if all_dfs:
        # Concatenate all dataframes
        final_df = pd.concat(all_dfs, ignore_index=True)
        
        # Save merged result
        output_filename = 'merged_distribution.csv'
        final_df.to_csv(output_filename, index=False)
        
        print(f"\nCreated {output_filename}")
        print(f"Total addresses processed: {len(final_df)}")
        print("\nUnique collections:")
        for collection in final_df['collection'].unique():
            count = len(final_df[final_df['collection'] == collection])
            print(f"- {collection}: {count} addresses")

# Example usage
if __name__ == "__main__":
    input_folder = "./output/all/all_braavos_argent/tokens/"  # Current directory, modify as needed
    merge_csvs(input_folder)