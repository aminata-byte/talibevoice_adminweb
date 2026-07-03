import { useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { X, Download } from "lucide-react";
import "./ExportPDFModal.css";

function ExportPDFModal({ titre, document: DocumentPDF, onClose }) {
  return (
    <div className="export-modal__overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal__header">
          <h3 className="export-modal__title">{titre}</h3>
          <div className="export-modal__actions">
            <PDFDownloadLink
              document={DocumentPDF}
              fileName={`${titre.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`}
              className="export-modal__download-btn"
            >
              {({ loading }) => (
                <>
                  <Download size={16} />
                  {loading ? "Génération..." : "Télécharger PDF"}
                </>
              )}
            </PDFDownloadLink>
            <button className="export-modal__close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="export-modal__preview">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            {DocumentPDF}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}

export default ExportPDFModal;
