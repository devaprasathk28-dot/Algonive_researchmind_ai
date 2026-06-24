import os
import shutil

def delete_local_files(file_path: str = None, report_path: str = None):
    """
    Deletes the local PDF file and report files associated with a paper.
    """
    if file_path and os.path.exists(file_path):
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"Error deleting local PDF file: {e}")
            
    if report_path and os.path.exists(report_path):
        try:
            if os.path.isfile(report_path):
                os.remove(report_path)
            elif os.path.isdir(report_path):
                shutil.rmtree(report_path)
        except Exception as e:
            print(f"Error deleting local reports: {e}")
