import { useParams } from 'react-router-dom';
import ComingSoon from '../components/ComingSoon';

function PlayerDetailsPage() {
  const { id } = useParams();

  return (
    <div>
      <ComingSoon pageName="Player Details" />
      <p>Player ID: {id}</p>
    </div>
  );
}

export default PlayerDetailsPage;
