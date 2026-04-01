import { useSpaces } from '../hooks/useSpaces';

const SpaceBadge = ({ spaceId, space: spaceProp, size = 'sm' }) => {
    const { spaces, loading } = useSpaces();
    
    let space = spaceProp;
    if (!space && spaceId) {
        space = spaces.find(s => s.id === spaceId);
    }
    
    if (!space || loading) {
        return null;
    }

    const sizeClass = size === 'lg' ? 'space-badge-lg' : '';

    return (
        <span
            className={`space-badge ${sizeClass}`}
            style={{ '--badge-color': space.color }}
        >
            <span className="space-badge-icon">{space.icon}</span>
            {space.name}
        </span>
    );
};

export default SpaceBadge;