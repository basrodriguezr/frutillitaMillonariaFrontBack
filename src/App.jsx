import './App.css';
import PhaserGame from './game/PhaserGame';
import SlotUI from './components/SlotUI';

/**
 * Componente raíz de la aplicación.
 * Renderiza la capa Phaser y la capa React de UI.
 * No requiere parámetros.
 */
function App() {
  return (
    <>
      <PhaserGame />
      <SlotUI />
    </>
  );
}

export default App;
