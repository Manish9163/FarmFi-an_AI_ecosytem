import { useState, useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';

export default function ImageUpload({ onSubmit, loading }) {
  const [preview, setPreview] = useState(null);
  const [file,    setFile]    = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    onSubmit(fd);
  };

  const clear = () => { setFile(null); setPreview(null); };

  return (
    <div className="card">
      <div className="card-header">
        <Image size={20} color="var(--primary)" />
        <h2>Upload Leaf Image</h2>
      </div>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !preview && inputRef.current.click()}
      >
        {preview ? (
          <div className="preview-wrap">
            <img src={preview} alt="Leaf preview" className="preview-img" />
            <button className="clear-btn" onClick={(e) => { e.stopPropagation(); clear(); }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="drop-prompt">
            <Upload size={40} color="var(--green-400)" />
            <p>Drag & drop or <span className="link-text">browse</span></p>
            <p className="hint">JPEG, PNG, WebP — max 16 MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
        onClick={handleSubmit}
        disabled={!file || loading}
      >
        {loading ? 'Analyzing…' : 'Detect Disease'}
      </button>

      <style>{`
        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: border-color .2s;
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drop-zone:hover { border-color: var(--primary); }
        .drop-prompt { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .drop-prompt p { margin: 0; font-size: .875rem; color: var(--text-muted); }
        .link-text { color: var(--primary); font-weight: 600; }
        .hint { font-size: .75rem !important; }
        .preview-wrap { position: relative; display: inline-block; }
        .preview-img { max-height: 200px; border-radius: var(--radius-sm); object-fit: contain; }
        .clear-btn {
          position: absolute; top: -8px; right: -8px;
          background: var(--danger); color: #fff;
          border: none; border-radius: 50%;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
