import pandas as pd
from pathlib import Path

def transform_to_controller(input_file):
    """
    Transform input CSV containing addresses into controller distribution format.
    """
    try:
        # Read input CSV
        df = pd.read_csv(input_file)
        
        # Create new DataFrame with required format
        new_df = pd.DataFrame({
            'address': df['address'],
            'quantity': 2,  # Fixed quantity for all
            'collection': 'controller',  # Fixed collection name
            'expiration_timestamp': 1733656248  # Fixed timestamp
        })
        
        # Save to CSV
        output_filename = 'controller_distribution.csv'
        new_df.to_csv(output_filename, index=False)
        print(f"Created {output_filename}")
        print(f"\nProcessed {len(new_df)} addresses")
        print("\nPreview of the output:")
        print(new_df)
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")

# Example usage
if __name__ == "__main__":
    input_file = "./output/all/all_controller/controllers.csv"
    transform_to_controller(input_file)