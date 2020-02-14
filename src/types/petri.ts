interface Place {
  label: string;
  name: string;
  x: number;
  y: number;
}

interface Produce {
  label: string;
  guard: string | null;
}

interface Transition {
  label: string;
  name: string;
  consume: Array<string>;
  produce: Array<Produce>;
  x: number;
  y: number;
}

export interface PetriNet {
  places: Array<Place>;
  transitions: Array<Transition>;
  start_place: string;
  end_place: string;
}
