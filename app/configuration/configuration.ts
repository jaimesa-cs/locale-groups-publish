export const MANGO_CONFIGURATION_NAME = "Mango Publishing Configuration";

export interface Configuration {
  name: string;
  groups: GroupConfiguration[];
}
type DifType = "+" | "-" | "=";

export interface GroupConfiguration {
  name: string;
  checked?: boolean;
  countries: CountryData[];
}

export interface PeriodTime {
  hours: number;
  dif: DifType;
}

export interface CountryData {
  name: string;
  locale: string;
  checked?: boolean;
  enabled?: boolean;
  winterTime: PeriodTime;
  summerTime: PeriodTime;
}

const configuration: Configuration = {
  name: MANGO_CONFIGURATION_NAME,
  groups: [
    {
      name: "Espana + Resto",
      countries: [
        {
          name: "Spain",
          locale: "es-es",
          winterTime: {
            hours: 0,
            dif: "=",
          },
          summerTime: {
            hours: 0,
            dif: "=",
          },
        },
        {
          name: "Aruba",
          locale: "aw",
          winterTime: {
            hours: 5,
            dif: "+",
          },
          summerTime: {
            hours: 6,
            dif: "+",
          },
        },
      ],
    },
    {
      name: "Russia & Kazajistan",
      countries: [
        {
          name: "Kazakhstan",
          locale: "kz",
          winterTime: {
            hours: 5,
            dif: "-",
          },
          summerTime: {
            hours: 4,
            dif: "-",
          },
        },
        {
          name: "Russia",
          locale: "ru",
          winterTime: {
            hours: 2,
            dif: "-",
          },
          summerTime: {
            hours: 1,
            dif: "-",
          },
        },
      ],
    },
  ],
};
export default configuration;
