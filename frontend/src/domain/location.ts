export interface LocationImage {
  _id: string;
  image: string;   // "95.jpg"
}

export interface LocationTag {
  tag: string;
}

export interface Location {
  _id: string;
  title: string;
  longitude: number;
  latitude: number;
  date: number;
  category: string;
  description: string;
  street: string;
  zip: number;
  city: string;
  country: string;
  user: string;
  danger: string;
  time_category: string;
  tags: LocationTag[];
  images: LocationImage[];
}
