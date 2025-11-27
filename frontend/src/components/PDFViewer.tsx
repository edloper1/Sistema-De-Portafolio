import React, { useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  fileUrl?: string;
  fileName: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName }) => {
  const isPDF = fileName.toLowerCase().endsWith('.pdf');
  
  // Debug: verificar que fileUrl existe
  useEffect(() => {
    if (fileUrl) {
      console.log('PDFViewer - fileUrl existe:', fileUrl.substring(0, 50) + '...');
    } else {
      console.log('PDFViewer - fileUrl no existe');
    }
  }, [fileUrl]);
  
  return (
    <div className="w-full h-full min-h-[600px] bg-gray-100 rounded-lg border-2 border-gray-300 flex flex-col">
      <div className="bg-gray-800 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-300 hover:text-blue-100 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir en nueva pestaña
          </a>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        {fileUrl && isPDF ? (
          <div className="w-full h-full min-h-[550px] bg-white rounded overflow-hidden">
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-full min-h-[550px]"
              title={fileName}
            />
          </div>
        ) : fileUrl && !isPDF ? (
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Archivo no PDF
            </h3>
            <p className="text-gray-600 mb-4">
              Este tipo de archivo no se puede visualizar directamente. Por favor descárgalo para verlo.
            </p>
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Descargar archivo
            </a>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Vista Previa del Archivo
            </h3>
            <p className="text-gray-600 mb-4">
              {isPDF 
                ? 'El archivo PDF se mostrará aquí cuando esté disponible'
                : 'Vista previa disponible solo para archivos PDF'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> En un sistema de producción con backend, aquí se mostraría
                el contenido del archivo PDF directamente. Por ahora, este es un sistema de demostración
                con almacenamiento local.
              </p>
            </div>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Descargar archivo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};




