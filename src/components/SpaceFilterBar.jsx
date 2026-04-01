import { useSpaces } from '../hooks/useSpaces';

const SpaceFilterBar = ({ activeSpace, onSelect }) => {
    const { spaces, loading } = useSpaces();

    if (loading) {
        return <div className="space-filter-bar">Loading spaces…</div>;
    }

    return (
        <div className="space-filter-bar">
            <button
                className={`space-filter-chip ${!activeSpace ? 'active' : ''}`}
                onClick={() => onSelect(null)}
            >
                🌐 All
            </button>
            {spaces.map((space) => (
                <button
                    key={space.id}
                    className={`space-filter-chip ${activeSpace === space.id ? 'active' : ''}`}
                    style={{ '--chip-color': space.color }}
                    onClick={() => onSelect(space.id)}
                >
                    {space.icon} {space.name}
                </button>
            ))}
        </div>
    );
};

export default SpaceFilterBar;