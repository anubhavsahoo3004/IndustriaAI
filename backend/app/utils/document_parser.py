import os
import re
import hashlib
from typing import Dict, Any, Tuple
import fitz # PyMuPDF
import docx

class DocumentParser:
    """
    Utility for parsing PDF, DOCX, and TXT files and extracting text content,
    structural metadata, and heuristic field patterns (PAN, GSTIN, Names, Addresses).
    """

    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for block in iter(lambda: f.read(65536), b""):
                sha256.update(block)
        return sha256.hexdigest()

    @classmethod
    def extract_text(cls, file_path: str, file_type: str) -> Tuple[str, Dict[str, Any]]:
        text = ""
        meta = {
            "page_count": 1,
            "word_count": 0,
            "char_count": 0,
            "detected_fields": {}
        }

        ext = file_type.upper()

        try:
            if ext == "PDF":
                doc = fitz.open(file_path)
                meta["page_count"] = len(doc)
                pages_text = []
                for page in doc:
                    pages_text.append(page.get_text())
                text = "\n".join(pages_text)
                doc.close()
            elif ext in ["DOCX", "DOC"]:
                doc = docx.Document(file_path)
                paragraphs = [p.text for p in doc.paragraphs if p.text]
                for table in doc.tables:
                    for row in table.rows:
                        row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                        if row_text:
                            paragraphs.append(row_text)
                text = "\n".join(paragraphs)
                meta["page_count"] = max(1, len(text) // 2000)
            elif ext in ["TXT", "MD"]:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            else:
                # Binary / Image fallback text placeholder
                text = f"[Uploaded Document: {os.path.basename(file_path)}]"
        except Exception as e:
            text = f"[Error reading file content: {str(e)}]"

        meta["char_count"] = len(text)
        meta["word_count"] = len(text.split())

        # Heuristic entity extraction
        meta["detected_fields"] = cls.extract_heuristics(text)

        return text, meta

    @staticmethod
    def extract_heuristics(text: str) -> Dict[str, Any]:
        results = {}

        # PAN pattern (5 uppercase letters, 4 digits, 1 uppercase letter)
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', text)
        if pan_match:
            results["pan"] = pan_match.group(0)

        # GSTIN pattern (2 digits state code + PAN + 1 digit + Z + 1 check char)
        gstin_match = re.search(r'\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b', text)
        if gstin_match:
            results["gstin"] = gstin_match.group(0)

        # Udyam pattern (UDYAM-MH-XX-XXXXXXX)
        udyam_match = re.search(r'\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}\b', text, re.IGNORECASE)
        if udyam_match:
            results["udyam"] = udyam_match.group(0).upper()

        # Date pattern (DD/MM/YYYY or DD-MM-YYYY)
        dates = re.findall(r'\b[0-3]?[0-9][/-][0-1]?[0-9][/-](?:19|20)[0-9]{2}\b', text)
        if dates:
            results["dates_found"] = dates[:3]

        return results
