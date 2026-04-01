import { useState } from 'react';
import { Settings, CheckCircle, AlertTriangle, Key, Trash2 } from 'lucide-react';
import { getApiKey, setApiKey, hasApiKey } from '../lib/embeddings';

const SettingsPage = () => {
    const [key, setKey] = useState(getApiKey());
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleSave = () => {
        setApiKey(key);
        setSaved(true);
        setTestResult(null);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        setKey('');
        setApiKey('');
        setTestResult(null);
    };

    const handleTest = async () => {
        if (!key) return;
        setTesting(true);
        setTestResult(null);
        setApiKey(key);

        try {
            const response = await fetch('/api/deepseek/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-embedding-v2',
                    input: ['test connection'],
                }),
            });

            if (response.ok) {
                setTestResult({ success: true, message: 'Connected successfully! Embeddings are working.' });
            } else {
                const err = await response.json().catch(() => ({}));
                setTestResult({ success: false, message: err.error?.message || `Error ${response.status}` });
            }
        } catch (err) {
            setTestResult({ success: false, message: err.message });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <Settings size={32} />
                    <h1>Settings</h1>
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">
                        <Key size={20} />
                        DeepSeek API Key
                    </h2>
                    <p className="settings-description">
                        Connect your DeepSeek API key to use real AI embeddings for event matching.
                        Without a key, the app uses a lightweight TF-IDF fallback.
                        Get your free key at{' '}
                        <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" className="settings-link">
                            platform.deepseek.com
                        </a>
                    </p>

                    <div className="settings-input-group">
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="settings-input"
                        />
                    </div>

                    <div className="settings-actions">
                        <button className="btn btn-primary" onClick={handleSave} disabled={!key}>
                            {saved ? <><CheckCircle size={16} /> Saved!</> : 'Save Key'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleTest} disabled={!key || testing}>
                            {testing ? 'Testing…' : 'Test Connection'}
                        </button>
                        {hasApiKey() && (
                            <button className="btn btn-secondary" onClick={handleClear} style={{ color: '#ef4444' }}>
                                <Trash2 size={16} /> Remove Key
                            </button>
                        )}
                    </div>

                    {testResult && (
                        <div className={`settings-alert ${testResult.success ? 'success' : 'error'}`}>
                            {testResult.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                            <span>{testResult.message}</span>
                        </div>
                    )}
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">Current Engine</h2>
                    <div className="engine-status">
                        <div className={`engine-dot ${hasApiKey() ? 'active' : 'fallback'}`} />
                        <span>
                            {hasApiKey()
                                ? 'DeepSeek Embeddings (deepseek-embedding-v2)'
                                : 'TF-IDF Fallback (client-side)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
