const {useEffect, useMemo, useState} = React;

// helpers
const now = () => new Date().toLocaleString();
const uid = () => Math.random().toString(36).slice(2,8);
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];

// Real data from CSV files (first 200 rows)
let realGeoData = [
  {link_id: 0, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-08 08:23:53", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: null, geo_day_int: 19000, geo_band: "mid"},
  {link_id: 1, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-09 06:20:43", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19001, geo_band: "mid"},
  {link_id: 2, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-10 06:17:25", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19002, geo_band: "mid"},
  {link_id: 3, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-11 14:31:30", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19003, geo_band: "low"},
  {link_id: 4, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-14 07:57:30", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19006, geo_band: "low"},
  {link_id: 5, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-15 16:49:06", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19007, geo_band: "mid"},
  {link_id: 6, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-18 05:07:15", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19010, geo_band: "mid"},
  {link_id: 7, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-18 07:41:00", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19010, geo_band: "low"},
  {link_id: 8, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-18 11:28:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19010, geo_band: "low"},
  {link_id: 9, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-19 02:40:40", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19011, geo_band: "mid"},
  {link_id: 10, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-19 09:07:40", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19011, geo_band: "low"},
  {link_id: 11, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-20 05:38:39", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19012, geo_band: "mid"},
  {link_id: 12, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-20 06:01:39", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19012, geo_band: "mid"},
  {link_id: 13, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-20 13:15:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19012, geo_band: "low"},
  {link_id: 14, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-20 13:36:33", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19012, geo_band: "low"},
  {link_id: 15, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-21 06:29:21", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19013, geo_band: "mid"},
  {link_id: 16, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-23 00:11:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19015, geo_band: "mid"},
  {link_id: 17, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-23 12:32:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19015, geo_band: "mid"},
  {link_id: 18, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-24 05:58:23", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19016, geo_band: "mid"},
  {link_id: 19, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-24 09:29:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19016, geo_band: "low"},
  {link_id: 20, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-24 12:12:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19016, geo_band: "low"},
  {link_id: 21, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-24 23:09:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19016, geo_band: "mid"},
  {link_id: 22, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-25 06:17:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19017, geo_band: "mid"},
  {link_id: 23, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-25 11:59:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19017, geo_band: "low"},
  {link_id: 24, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-26 15:26:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19018, geo_band: "low"},
  {link_id: 25, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-27 02:10:16", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19019, geo_band: "mid"},
  {link_id: 26, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-31 07:00:02", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19023, geo_band: "low"},
  {link_id: 27, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-01-31 09:27:24", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19023, geo_band: "low"},
  {link_id: 28, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-01 11:20:22", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19024, geo_band: "low"},
  {link_id: 29, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-01 14:06:08", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19024, geo_band: "low"},
  {link_id: 30, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-02 12:04:28", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19025, geo_band: "low"},
  {link_id: 31, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-02 12:47:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19025, geo_band: "low"},
  {link_id: 32, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-03 08:05:20", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19026, geo_band: "low"},
  {link_id: 33, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-03 09:33:47", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19026, geo_band: "low"},
  {link_id: 34, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-04 04:33:10", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19027, geo_band: "mid"},
  {link_id: 35, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-04 07:36:17", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19027, geo_band: "low"},
  {link_id: 36, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-04 22:50:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19027, geo_band: "mid"},
  {link_id: 37, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-05 13:59:00", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19028, geo_band: "mid"},
  {link_id: 38, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-05 20:05:53", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19028, geo_band: "mid"},
  {link_id: 39, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-05 22:28:11", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19028, geo_band: "mid"},
  {link_id: 40, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-05 23:53:41", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19028, geo_band: "mid"},
  {link_id: 41, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-06 15:49:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19029, geo_band: "mid"},
  {link_id: 42, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-06 18:45:24", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19029, geo_band: "mid"},
  {link_id: 43, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-07 06:50:20", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19030, geo_band: "mid"},
  {link_id: 44, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-08 11:24:17", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19031, geo_band: "low"},
  {link_id: 45, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 00:38:42", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 46, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 02:44:11", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 47, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 05:08:44", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 48, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 05:16:13", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 49, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 06:41:27", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 50, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-09 23:52:32", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19032, geo_band: "mid"},
  {link_id: 51, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-10 20:54:47", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19033, geo_band: "low"},
  {link_id: 52, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 01:28:51", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19034, geo_band: "mid"},
  {link_id: 53, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 04:28:34", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19034, geo_band: "mid"},
  {link_id: 54, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 07:56:08", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19034, geo_band: "low"},
  {link_id: 55, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 09:37:01", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19034, geo_band: "low"},
  {link_id: 56, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 10:13:43", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19034, geo_band: "low"},
  {link_id: 57, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-11 14:40:24", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19034, geo_band: "low"},
  {link_id: 58, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-12 09:58:42", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19035, geo_band: "mid"},
  {link_id: 59, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-12 14:53:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19035, geo_band: "mid"},
  {link_id: 60, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-12 23:20:51", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19035, geo_band: "mid"},
  {link_id: 61, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-13 02:03:51", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19036, geo_band: "mid"},
  {link_id: 62, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-13 05:06:39", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19036, geo_band: "mid"},
  {link_id: 63, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-13 10:46:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19036, geo_band: "mid"},
  {link_id: 64, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-13 13:05:59", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19036, geo_band: "mid"},
  {link_id: 65, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-14 01:19:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19037, geo_band: "mid"},
  {link_id: 66, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-14 05:16:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19037, geo_band: "mid"},
  {link_id: 67, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-14 06:06:20", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19037, geo_band: "mid"},
  {link_id: 68, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-14 11:42:13", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19037, geo_band: "low"},
  {link_id: 69, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-14 15:29:50", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19037, geo_band: "low"},
  {link_id: 70, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-15 00:51:30", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19038, geo_band: "mid"},
  {link_id: 71, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-15 07:51:00", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19038, geo_band: "low"},
  {link_id: 72, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-15 11:32:26", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19038, geo_band: "low"},
  {link_id: 73, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-15 21:10:44", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19038, geo_band: "low"},
  {link_id: 74, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-16 08:57:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19039, geo_band: "low"},
  {link_id: 75, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-16 12:45:32", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19039, geo_band: "low"},
  {link_id: 76, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-16 15:30:02", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19039, geo_band: "low"},
  {link_id: 77, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-16 15:54:44", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19039, geo_band: "low"},
  {link_id: 78, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-16 23:31:53", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19039, geo_band: "mid"},
  {link_id: 79, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-17 00:14:27", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19040, geo_band: "mid"},
  {link_id: 80, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-17 19:10:27", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19040, geo_band: "low"},
  {link_id: 81, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-17 21:14:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19040, geo_band: "low"},
  {link_id: 82, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-19 23:58:47", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19042, geo_band: "mid"},
  {link_id: 83, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-20 06:55:24", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19043, geo_band: "mid"},
  {link_id: 84, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-20 13:37:53", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19043, geo_band: "mid"},
  {link_id: 85, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-21 04:40:14", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19044, geo_band: "mid"},
  {link_id: 86, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-21 13:00:34", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19044, geo_band: "low"},
  {link_id: 87, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-21 13:29:04", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19044, geo_band: "low"},
  {link_id: 88, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-22 10:08:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19045, geo_band: "low"},
  {link_id: 89, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-23 09:14:27", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19046, geo_band: "low"},
  {link_id: 90, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-23 15:55:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19046, geo_band: "low"},
  {link_id: 91, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-24 21:42:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19047, geo_band: "low"},
  {link_id: 92, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-25 17:33:30", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19048, geo_band: "low"},
  {link_id: 93, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-26 06:05:46", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19049, geo_band: "mid"},
  {link_id: 94, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-26 06:19:35", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19049, geo_band: "mid"},
  {link_id: 95, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-26 07:51:41", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19049, geo_band: "mid"},
  {link_id: 96, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-26 11:16:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19049, geo_band: "mid"},
  {link_id: 97, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-26 20:02:32", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19049, geo_band: "mid"},
  {link_id: 98, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 00:01:05", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 99, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 05:34:25", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 100, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 06:14:22", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 101, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 08:10:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 102, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 17:57:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 103, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 18:48:24", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 104, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-27 22:01:29", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19050, geo_band: "mid"},
  {link_id: 105, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-28 02:31:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19051, geo_band: "mid"},
  {link_id: 106, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-02-28 20:14:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19051, geo_band: "low"},
  {link_id: 107, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-01 09:30:05", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19052, geo_band: "low"},
  {link_id: 108, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-02 14:05:42", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19053, geo_band: "low"},
  {link_id: 109, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-03 03:19:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19054, geo_band: "mid"},
  {link_id: 110, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-03 11:09:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19054, geo_band: "low"},
  {link_id: 111, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-04 07:53:34", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19055, geo_band: "low"},
  {link_id: 112, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-04 22:51:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19055, geo_band: "mid"},
  {link_id: 113, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-05 03:06:02", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19056, geo_band: "mid"},
  {link_id: 114, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-05 10:34:42", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19056, geo_band: "mid"},
  {link_id: 115, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-06 15:47:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19057, geo_band: "mid"},
  {link_id: 116, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-07 18:33:47", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19058, geo_band: "low"},
  {link_id: 117, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-07 19:16:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19058, geo_band: "low"},
  {link_id: 118, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-08 04:43:13", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19059, geo_band: "mid"},
  {link_id: 119, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-08 09:52:52", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19059, geo_band: "low"},
  {link_id: 120, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-08 20:02:25", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19059, geo_band: "low"},
  {link_id: 121, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-10 12:27:31", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19061, geo_band: "low"},
  {link_id: 122, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-10 19:34:21", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19061, geo_band: "low"},
  {link_id: 123, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-11 13:14:54", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19062, geo_band: "low"},
  {link_id: 124, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-11 23:39:01", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19062, geo_band: "mid"},
  {link_id: 125, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-12 08:07:21", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19063, geo_band: "mid"},
  {link_id: 126, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-12 12:36:11", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19063, geo_band: "mid"},
  {link_id: 127, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-12 14:58:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19063, geo_band: "mid"},
  {link_id: 128, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-12 17:29:28", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19063, geo_band: "mid"},
  {link_id: 129, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-12 19:12:32", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19063, geo_band: "mid"},
  {link_id: 130, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-13 07:05:00", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19064, geo_band: "mid"},
  {link_id: 131, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-13 11:10:50", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19064, geo_band: "mid"},
  {link_id: 132, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-13 21:26:34", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19064, geo_band: "mid"},
  {link_id: 133, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-14 05:37:49", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19065, geo_band: "mid"},
  {link_id: 134, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-14 05:48:06", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19065, geo_band: "mid"},
  {link_id: 135, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-14 21:19:12", latitude: -88.330078125, longitude: -134.12109375, composite_suspicion_score: 0.1014290628429582, geo_day_int: 19065, geo_band: "low"},
  {link_id: 136, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-15 11:12:02", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0987176564083523, geo_day_int: 19066, geo_band: "low"},
  {link_id: 137, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 03:07:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19067, geo_band: "mid"},
  {link_id: 138, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 07:08:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 139, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 08:03:04", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 140, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 11:17:26", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 141, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 13:09:23", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 142, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 19:08:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 143, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-16 20:53:29", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19067, geo_band: "low"},
  {link_id: 144, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-17 03:05:44", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19068, geo_band: "mid"},
  {link_id: 145, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-17 05:35:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19068, geo_band: "mid"},
  {link_id: 146, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-17 07:39:56", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19068, geo_band: "low"},
  {link_id: 147, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-17 08:12:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19068, geo_band: "low"},
  {link_id: 148, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-17 19:27:02", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19068, geo_band: "low"},
  {link_id: 149, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-18 20:44:01", latitude: -88.330078125, longitude: -134.12109375, composite_suspicion_score: 0.1015313573575521, geo_day_int: 19069, geo_band: "low"},
  {link_id: 150, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-19 11:41:05", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1787388593432352, geo_day_int: 19070, geo_band: "mid"},
  {link_id: 151, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-19 19:22:43", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19070, geo_band: "mid"},
  {link_id: 152, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-19 19:24:59", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19070, geo_band: "mid"},
  {link_id: 153, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-20 11:01:16", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19071, geo_band: "mid"},
  {link_id: 154, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-20 15:47:26", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19071, geo_band: "mid"},
  {link_id: 155, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-21 13:29:11", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19072, geo_band: "low"},
  {link_id: 156, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-21 14:35:10", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19072, geo_band: "low"},
  {link_id: 157, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-21 20:22:29", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19072, geo_band: "low"},
  {link_id: 158, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-22 15:16:43", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19073, geo_band: "low"},
  {link_id: 159, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-22 23:59:18", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19073, geo_band: "mid"},
  {link_id: 160, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-23 06:56:13", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19074, geo_band: "mid"},
  {link_id: 161, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-24 18:20:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19075, geo_band: "low"},
  {link_id: 162, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-25 19:22:19", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19076, geo_band: "low"},
  {link_id: 163, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-26 10:20:16", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19077, geo_band: "mid"},
  {link_id: 164, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-26 15:26:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19077, geo_band: "mid"},
  {link_id: 165, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-27 01:17:28", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19078, geo_band: "mid"},
  {link_id: 166, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-27 11:06:28", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19078, geo_band: "mid"},
  {link_id: 167, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-27 21:53:55", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19078, geo_band: "mid"},
  {link_id: 168, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-28 01:58:48", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19079, geo_band: "mid"},
  {link_id: 169, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-29 15:27:12", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19080, geo_band: "low"},
  {link_id: 170, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-29 23:24:55", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19080, geo_band: "mid"},
  {link_id: 171, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-30 18:43:09", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19081, geo_band: "low"},
  {link_id: 172, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-30 20:22:17", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19081, geo_band: "low"},
  {link_id: 173, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-31 07:46:07", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19082, geo_band: "low"},
  {link_id: 174, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-03-31 13:08:16", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19082, geo_band: "low"},
  {link_id: 175, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-01 10:24:20", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19083, geo_band: "low"},
  {link_id: 176, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-01 13:11:53", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19083, geo_band: "low"},
  {link_id: 177, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-02 05:03:05", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19084, geo_band: "mid"},
  {link_id: 178, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-02 10:38:05", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19084, geo_band: "mid"},
  {link_id: 179, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-02 15:02:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19084, geo_band: "mid"},
  {link_id: 180, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-02 16:44:34", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19084, geo_band: "mid"},
  {link_id: 181, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-03 06:23:36", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19085, geo_band: "mid"},
  {link_id: 182, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-03 06:25:16", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19085, geo_band: "mid"},
  {link_id: 183, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-03 14:39:06", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19085, geo_band: "mid"},
  {link_id: 184, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-03 17:37:14", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.1790137712934421, geo_day_int: 19085, geo_band: "mid"},
  {link_id: 185, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-04 00:45:36", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19086, geo_band: "mid"},
  {link_id: 186, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-04 06:26:54", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19086, geo_band: "mid"},
  {link_id: 187, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-04 10:06:28", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19086, geo_band: "low"},
  {link_id: 188, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-05 18:05:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19087, geo_band: "low"},
  {link_id: 189, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-05 18:06:37", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19087, geo_band: "low"},
  {link_id: 190, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-06 08:04:06", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19088, geo_band: "low"},
  {link_id: 191, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-06 13:41:50", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19088, geo_band: "low"},
  {link_id: 192, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-06 22:25:10", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19088, geo_band: "mid"},
  {link_id: 193, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-07 00:52:22", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2190137712934421, geo_day_int: 19089, geo_band: "mid"},
  {link_id: 194, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-07 08:00:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19089, geo_band: "low"},
  {link_id: 195, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-08 17:32:45", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.0990137712934421, geo_day_int: 19090, geo_band: "low"},
  {link_id: 196, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-09 05:20:46", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19091, geo_band: "mid"},
  {link_id: 197, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-09 05:26:08", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.2990137712934421, geo_day_int: 19091, geo_band: "mid"},
  {link_id: 198, entity_id: 0, label_isFraud: 0, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-09 12:20:29", latitude: -31.904296875, longitude: -30.41015625, composite_suspicion_score: 0.306139846130635, geo_day_int: 19091, geo_band: "mid"},
  {link_id: 199, entity_id: 0, label_isFraud: 1, client_id: "0001edbc5ab720f70a615ed9e8429df9b6c3f3c3999a511911d3e7cae2fd6896", event_time: "2022-04-09 13:00:58", latitude: -89.97802734375, longitude: -134.93408203125, composite_suspicion_score: 0.3751586025168155, geo_day_int: 19091, geo_band: "mid"},
];
// limit to first 50 rows
realGeoData = realGeoData.slice(0, 50);

let realTxData = [
  {link_id: 0, entity_id: 0, label_isFraud: 1, step: 463, type: "CASH_OUT", amount: 4152435.91, nameOrig: "C869608189", oldbalanceOrg: 4152435.91, newbalanceOrig: 0.0, nameDest: "C1391783413", oldbalanceDest: 0.0, newbalanceDest: 4152435.91, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 19},
  {link_id: 1, entity_id: 0, label_isFraud: 1, step: 600, type: "CASH_OUT", amount: 1158070.88, nameOrig: "C475917062", oldbalanceOrg: 1158070.88, newbalanceOrig: 0.0, nameDest: "C607981921", oldbalanceDest: 0.0, newbalanceDest: 1158070.88, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 25},
  {link_id: 2, entity_id: 0, label_isFraud: 1, step: 668, type: "CASH_OUT", amount: 4022098.69, nameOrig: "C105027468", oldbalanceOrg: 4022098.69, newbalanceOrig: 0.0, nameDest: "C303839764", oldbalanceDest: 58314.1, newbalanceDest: 4080412.79, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 27},
  {link_id: 3, entity_id: 0, label_isFraud: 0, step: 204, type: "CASH_IN", amount: 70019.35, nameOrig: "C167053857", oldbalanceOrg: 1924.0, newbalanceOrig: 71943.35, nameDest: "C529866831", oldbalanceDest: 54589.9, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 4, entity_id: 0, label_isFraud: 0, step: 286, type: "PAYMENT", amount: 5498.41, nameOrig: "C1358422682", oldbalanceOrg: 10879.0, newbalanceOrig: 5380.59, nameDest: "M200162182", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 5, entity_id: 0, label_isFraud: 0, step: 300, type: "PAYMENT", amount: 54757.22, nameOrig: "C638400777", oldbalanceOrg: 42237.0, newbalanceOrig: 0.0, nameDest: "M1481138447", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 6, entity_id: 0, label_isFraud: 0, step: 329, type: "CASH_IN", amount: 447418.89, nameOrig: "C768368250", oldbalanceOrg: 784522.56, newbalanceOrig: 1231941.45, nameDest: "C282296271", oldbalanceDest: 1923437.71, newbalanceDest: 1476018.82, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 7, entity_id: 0, label_isFraud: 0, step: 130, type: "TRANSFER", amount: 888058.16, nameOrig: "C1551238444", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1779515127", oldbalanceDest: 26573310.85, newbalanceDest: 27461369.01, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 8, entity_id: 0, label_isFraud: 0, step: 35, type: "CASH_IN", amount: 380908.06, nameOrig: "C1628902044", oldbalanceOrg: 0.0, newbalanceOrig: 380908.06, nameDest: "C1975866536", oldbalanceDest: 1762565.77, newbalanceDest: 1381657.71, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 9, entity_id: 0, label_isFraud: 1, step: 477, type: "TRANSFER", amount: 338293.14, nameOrig: "C958803448", oldbalanceOrg: 338293.14, newbalanceOrig: 0.0, nameDest: "C229298168", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 19},
  {link_id: 10, entity_id: 0, label_isFraud: 0, step: 306, type: "CASH_OUT", amount: 21605.9, nameOrig: "C662527317", oldbalanceOrg: 20784.0, newbalanceOrig: 0.0, nameDest: "C730687860", oldbalanceDest: 0.0, newbalanceDest: 21605.9, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 11, entity_id: 0, label_isFraud: 1, step: 125, type: "TRANSFER", amount: 621569.61, nameOrig: "C288917283", oldbalanceOrg: 621569.61, newbalanceOrig: 0.0, nameDest: "C652970534", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 12, entity_id: 0, label_isFraud: 0, step: 180, type: "PAYMENT", amount: 19883.12, nameOrig: "C1215286196", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1997202631", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 13, entity_id: 0, label_isFraud: 0, step: 237, type: "CASH_IN", amount: 303958.53, nameOrig: "C1713996386", oldbalanceOrg: 5759106.51, newbalanceOrig: 6063065.04, nameDest: "C1156938221", oldbalanceDest: 13590391.83, newbalanceDest: 13286433.31, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 14, entity_id: 0, label_isFraud: 0, step: 130, type: "PAYMENT", amount: 5725.12, nameOrig: "C1433460371", oldbalanceOrg: 245214.0, newbalanceOrig: 239488.88, nameDest: "M988809767", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 15, entity_id: 0, label_isFraud: 1, step: 48, type: "TRANSFER", amount: 147267.01, nameOrig: "C1261933788", oldbalanceOrg: 147267.01, newbalanceOrig: 0.0, nameDest: "C1058127621", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 2},
  {link_id: 16, entity_id: 0, label_isFraud: 1, step: 400, type: "TRANSFER", amount: 245155.25, nameOrig: "C1830554141", oldbalanceOrg: 245155.25, newbalanceOrig: 0.0, nameDest: "C1838718052", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 17, entity_id: 0, label_isFraud: 0, step: 332, type: "PAYMENT", amount: 15029.35, nameOrig: "C1574564059", oldbalanceOrg: 107.0, newbalanceOrig: 0.0, nameDest: "M1326339033", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 18, entity_id: 0, label_isFraud: 1, step: 244, type: "TRANSFER", amount: 2468740.94, nameOrig: "C1794935564", oldbalanceOrg: 2468740.94, newbalanceOrig: 0.0, nameDest: "C1234144009", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 19, entity_id: 0, label_isFraud: 0, step: 137, type: "TRANSFER", amount: 218419.33, nameOrig: "C1175467379", oldbalanceOrg: 15950.0, newbalanceOrig: 0.0, nameDest: "C459322557", oldbalanceDest: 1113616.35, newbalanceDest: 1332035.68, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 20, entity_id: 0, label_isFraud: 0, step: 189, type: "CASH_IN", amount: 328703.93, nameOrig: "C373258664", oldbalanceOrg: 1267317.32, newbalanceOrig: 1596021.25, nameDest: "C1543219271", oldbalanceDest: 844757.81, newbalanceDest: 516053.88, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 21, entity_id: 0, label_isFraud: 0, step: 21, type: "CASH_OUT", amount: 71054.23, nameOrig: "C1401930928", oldbalanceOrg: 79482.83, newbalanceOrig: 8428.6, nameDest: "C233550127", oldbalanceDest: 6554830.18, newbalanceDest: 6625884.41, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 22, entity_id: 0, label_isFraud: 0, step: 181, type: "CASH_OUT", amount: 343533.42, nameOrig: "C1130449378", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1956756848", oldbalanceDest: 9138819.22, newbalanceDest: 9463033.55, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 23, entity_id: 0, label_isFraud: 0, step: 372, type: "TRANSFER", amount: 695359.96, nameOrig: "C792303855", oldbalanceOrg: 71927.0, newbalanceOrig: 0.0, nameDest: "C1037538104", oldbalanceDest: 252214.18, newbalanceDest: 947574.14, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 24, entity_id: 0, label_isFraud: 0, step: 188, type: "PAYMENT", amount: 10876.89, nameOrig: "C116370677", oldbalanceOrg: 45478.0, newbalanceOrig: 34601.11, nameDest: "M1850283662", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 25, entity_id: 0, label_isFraud: 1, step: 470, type: "TRANSFER", amount: 864994.24, nameOrig: "C504859386", oldbalanceOrg: 864994.24, newbalanceOrig: 0.0, nameDest: "C1412133328", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 19},
  {link_id: 26, entity_id: 0, label_isFraud: 0, step: 9, type: "PAYMENT", amount: 27132.32, nameOrig: "C94407466", oldbalanceOrg: 436.0, newbalanceOrig: 0.0, nameDest: "M1354614450", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 27, entity_id: 0, label_isFraud: 0, step: 14, type: "CASH_IN", amount: 3457.91, nameOrig: "C985379721", oldbalanceOrg: 9124076.0, newbalanceOrig: 9127533.91, nameDest: "C1692038831", oldbalanceDest: 385365.84, newbalanceDest: 381907.93, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 28, entity_id: 0, label_isFraud: 0, step: 133, type: "CASH_OUT", amount: 324943.42, nameOrig: "C356465495", oldbalanceOrg: 52220.0, newbalanceOrig: 0.0, nameDest: "C685411831", oldbalanceDest: 0.0, newbalanceDest: 230732.53, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 29, entity_id: 0, label_isFraud: 0, step: 178, type: "CASH_OUT", amount: 154417.48, nameOrig: "C1730379798", oldbalanceOrg: 405932.41, newbalanceOrig: 251514.93, nameDest: "C531417097", oldbalanceDest: 488321.19, newbalanceDest: 642738.67, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 30, entity_id: 0, label_isFraud: 0, step: 182, type: "TRANSFER", amount: 565222.57, nameOrig: "C1434985922", oldbalanceOrg: 1607.0, newbalanceOrig: 0.0, nameDest: "C704256569", oldbalanceDest: 0.0, newbalanceDest: 565222.57, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 31, entity_id: 0, label_isFraud: 0, step: 40, type: "CASH_OUT", amount: 88776.25, nameOrig: "C291257017", oldbalanceOrg: 10936.0, newbalanceOrig: 0.0, nameDest: "C1588307315", oldbalanceDest: 1277955.83, newbalanceDest: 1366732.08, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 32, entity_id: 0, label_isFraud: 0, step: 281, type: "PAYMENT", amount: 9102.27, nameOrig: "C640295892", oldbalanceOrg: 16846.0, newbalanceOrig: 7743.73, nameDest: "M926035272", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 33, entity_id: 0, label_isFraud: 0, step: 228, type: "CASH_OUT", amount: 180339.21, nameOrig: "C456307190", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C125053136", oldbalanceDest: 265882.81, newbalanceDest: 446222.01, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 34, entity_id: 0, label_isFraud: 0, step: 299, type: "PAYMENT", amount: 10442.03, nameOrig: "C446616843", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1217018224", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 35, entity_id: 0, label_isFraud: 0, step: 207, type: "PAYMENT", amount: 17225.7, nameOrig: "C1804429173", oldbalanceOrg: 206.0, newbalanceOrig: 0.0, nameDest: "M156945648", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 36, entity_id: 0, label_isFraud: 1, step: 39, type: "CASH_OUT", amount: 238717.5, nameOrig: "C1658110693", oldbalanceOrg: 238717.5, newbalanceOrig: 0.0, nameDest: "C222052738", oldbalanceDest: 601511.4, newbalanceDest: 671690.05, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 37, entity_id: 0, label_isFraud: 0, step: 275, type: "PAYMENT", amount: 8172.56, nameOrig: "C284404643", oldbalanceOrg: 2137.0, newbalanceOrig: 0.0, nameDest: "M2134563789", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 38, entity_id: 0, label_isFraud: 1, step: 184, type: "CASH_OUT", amount: 90346.05, nameOrig: "C1977671601", oldbalanceOrg: 90346.05, newbalanceOrig: 0.0, nameDest: "C1902927985", oldbalanceDest: 532789.09, newbalanceDest: 623135.14, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 39, entity_id: 0, label_isFraud: 0, step: 305, type: "CASH_IN", amount: 35452.97, nameOrig: "C423988523", oldbalanceOrg: 11232.0, newbalanceOrig: 46684.97, nameDest: "C1809999460", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 40, entity_id: 0, label_isFraud: 0, step: 166, type: "PAYMENT", amount: 6373.19, nameOrig: "C1473618002", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M696808500", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 41, entity_id: 0, label_isFraud: 1, step: 580, type: "TRANSFER", amount: 2925111.67, nameOrig: "C542286899", oldbalanceOrg: 2925111.67, newbalanceOrig: 0.0, nameDest: "C1537390237", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 24},
  {link_id: 42, entity_id: 0, label_isFraud: 1, step: 45, type: "TRANSFER", amount: 7335355.57, nameOrig: "C1102672587", oldbalanceOrg: 7335355.57, newbalanceOrig: 0.0, nameDest: "C735323689", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 43, entity_id: 0, label_isFraud: 1, step: 181, type: "TRANSFER", amount: 410299.86, nameOrig: "C364474699", oldbalanceOrg: 410299.86, newbalanceOrig: 0.0, nameDest: "C1549220926", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 44, entity_id: 0, label_isFraud: 0, step: 226, type: "CASH_OUT", amount: 132116.39, nameOrig: "C2139078813", oldbalanceOrg: 2477.0, newbalanceOrig: 0.0, nameDest: "C2081748643", oldbalanceDest: 0.0, newbalanceDest: 132116.39, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 45, entity_id: 0, label_isFraud: 1, step: 403, type: "CASH_OUT", amount: 196254.03, nameOrig: "C2032582234", oldbalanceOrg: 196254.03, newbalanceOrig: 0.0, nameDest: "C677415412", oldbalanceDest: 0.0, newbalanceDest: 196254.03, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 46, entity_id: 0, label_isFraud: 1, step: 143, type: "CASH_OUT", amount: 155854.37, nameOrig: "C1717994477", oldbalanceOrg: 155854.37, newbalanceOrig: 0.0, nameDest: "C1484687714", oldbalanceDest: 318930.35, newbalanceDest: 474784.71, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 47, entity_id: 0, label_isFraud: 0, step: 155, type: "PAYMENT", amount: 11347.95, nameOrig: "C1554762498", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1463971011", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 48, entity_id: 0, label_isFraud: 1, step: 537, type: "CASH_OUT", amount: 127447.68, nameOrig: "C987837660", oldbalanceOrg: 127447.68, newbalanceOrig: 0.0, nameDest: "C2119771429", oldbalanceDest: 1274456.97, newbalanceDest: 1401904.65, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 22},
  {link_id: 49, entity_id: 0, label_isFraud: 1, step: 552, type: "TRANSFER", amount: 22824.08, nameOrig: "C359830573", oldbalanceOrg: 22824.08, newbalanceOrig: 0.0, nameDest: "C1906309397", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 23},
  {link_id: 50, entity_id: 0, label_isFraud: 0, step: 286, type: "CASH_OUT", amount: 22280.24, nameOrig: "C1365862672", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C984490980", oldbalanceDest: 255267.04, newbalanceDest: 277547.29, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 51, entity_id: 0, label_isFraud: 0, step: 160, type: "CASH_IN", amount: 98676.84, nameOrig: "C2139600415", oldbalanceOrg: 7850315.49, newbalanceOrig: 7948992.33, nameDest: "C1685524910", oldbalanceDest: 625662.24, newbalanceDest: 526985.41, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 52, entity_id: 0, label_isFraud: 0, step: 167, type: "DEBIT", amount: 5480.79, nameOrig: "C235531241", oldbalanceOrg: 10689.0, newbalanceOrig: 5208.21, nameDest: "C1091272050", oldbalanceDest: 226097.61, newbalanceDest: 231578.39, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 53, entity_id: 0, label_isFraud: 1, step: 694, type: "TRANSFER", amount: 21358.8, nameOrig: "C146707584", oldbalanceOrg: 21358.8, newbalanceOrig: 0.0, nameDest: "C770227630", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 28},
  {link_id: 54, entity_id: 0, label_isFraud: 0, step: 592, type: "TRANSFER", amount: 128280.7, nameOrig: "C426706186", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1931622146", oldbalanceDest: 275820.89, newbalanceDest: 404101.59, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 24},
  {link_id: 55, entity_id: 0, label_isFraud: 0, step: 253, type: "CASH_OUT", amount: 48954.21, nameOrig: "C871491640", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1575852252", oldbalanceDest: 137632.08, newbalanceDest: 186586.3, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 56, entity_id: 0, label_isFraud: 0, step: 215, type: "TRANSFER", amount: 1042017.69, nameOrig: "C1649216054", oldbalanceOrg: 66446.0, newbalanceOrig: 0.0, nameDest: "C1232875102", oldbalanceDest: 0.0, newbalanceDest: 1042017.69, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 57, entity_id: 0, label_isFraud: 0, step: 157, type: "TRANSFER", amount: 754313.69, nameOrig: "C43590888", oldbalanceOrg: 23825.0, newbalanceOrig: 0.0, nameDest: "C1605447575", oldbalanceDest: 619990.77, newbalanceDest: 1374304.47, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 58, entity_id: 0, label_isFraud: 1, step: 74, type: "CASH_OUT", amount: 4375931.29, nameOrig: "C367894534", oldbalanceOrg: 4375931.29, newbalanceOrig: 0.0, nameDest: "C397644656", oldbalanceDest: 68494.86, newbalanceDest: 4444426.16, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 3},
  {link_id: 59, entity_id: 0, label_isFraud: 1, step: 295, type: "CASH_OUT", amount: 4531343.47, nameOrig: "C1462947577", oldbalanceOrg: 4531343.47, newbalanceOrig: 0.0, nameDest: "C1069720", oldbalanceDest: 0.0, newbalanceDest: 4531343.47, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 60, entity_id: 0, label_isFraud: 1, step: 245, type: "TRANSFER", amount: 688034.32, nameOrig: "C939293281", oldbalanceOrg: 688034.32, newbalanceOrig: 0.0, nameDest: "C1381364691", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 61, entity_id: 0, label_isFraud: 0, step: 307, type: "CASH_OUT", amount: 161844.29, nameOrig: "C844902175", oldbalanceOrg: 501396.0, newbalanceOrig: 339551.71, nameDest: "C625213866", oldbalanceDest: 82435.42, newbalanceDest: 244279.71, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 62, entity_id: 0, label_isFraud: 1, step: 33, type: "TRANSFER", amount: 9887819.06, nameOrig: "C1548903046", oldbalanceOrg: 9887819.06, newbalanceOrig: 0.0, nameDest: "C2065423383", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 63, entity_id: 0, label_isFraud: 0, step: 286, type: "PAYMENT", amount: 4624.9, nameOrig: "C2090384089", oldbalanceOrg: 19235.0, newbalanceOrig: 14610.1, nameDest: "M47738427", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 64, entity_id: 0, label_isFraud: 0, step: 405, type: "PAYMENT", amount: 3390.52, nameOrig: "C1767544016", oldbalanceOrg: 7060.0, newbalanceOrig: 3669.48, nameDest: "M424243050", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 65, entity_id: 0, label_isFraud: 1, step: 47, type: "TRANSFER", amount: 61487.67, nameOrig: "C825902720", oldbalanceOrg: 61487.67, newbalanceOrig: 0.0, nameDest: "C512979582", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 66, entity_id: 0, label_isFraud: 1, step: 39, type: "CASH_OUT", amount: 2070814.27, nameOrig: "C1115361466", oldbalanceOrg: 2070814.27, newbalanceOrig: 0.0, nameDest: "C521252518", oldbalanceDest: 0.0, newbalanceDest: 2070814.27, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 67, entity_id: 0, label_isFraud: 0, step: 290, type: "CASH_IN", amount: 81224.7, nameOrig: "C1907840409", oldbalanceOrg: 6466310.51, newbalanceOrig: 6547535.22, nameDest: "C275201219", oldbalanceDest: 599863.94, newbalanceDest: 518639.24, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 68, entity_id: 0, label_isFraud: 0, step: 131, type: "CASH_OUT", amount: 292599.06, nameOrig: "C1127948965", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1654688663", oldbalanceDest: 2001241.05, newbalanceDest: 2293840.11, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 69, entity_id: 0, label_isFraud: 0, step: 42, type: "PAYMENT", amount: 8934.35, nameOrig: "C1843127576", oldbalanceOrg: 77098.56, newbalanceOrig: 68164.21, nameDest: "M773240793", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 70, entity_id: 0, label_isFraud: 1, step: 484, type: "CASH_OUT", amount: 156220.74, nameOrig: "C389614238", oldbalanceOrg: 156220.74, newbalanceOrig: 0.0, nameDest: "C643171110", oldbalanceDest: 0.0, newbalanceDest: 156220.74, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 20},
  {link_id: 71, entity_id: 0, label_isFraud: 0, step: 332, type: "CASH_IN", amount: 20794.27, nameOrig: "C83407744", oldbalanceOrg: 8435690.6, newbalanceOrig: 8456484.87, nameDest: "C543495033", oldbalanceDest: 13498286.3, newbalanceDest: 13477492.03, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 72, entity_id: 0, label_isFraud: 0, step: 352, type: "PAYMENT", amount: 9438.16, nameOrig: "C330164949", oldbalanceOrg: 137488.0, newbalanceOrig: 128049.84, nameDest: "M1763621813", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 73, entity_id: 0, label_isFraud: 0, step: 41, type: "CASH_OUT", amount: 37736.97, nameOrig: "C1931066841", oldbalanceOrg: 154237.47, newbalanceOrig: 116500.5, nameDest: "C1757799653", oldbalanceDest: 103422.86, newbalanceDest: 821177.07, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 74, entity_id: 0, label_isFraud: 0, step: 33, type: "CASH_OUT", amount: 234417.22, nameOrig: "C1706492249", oldbalanceOrg: 254511.0, newbalanceOrig: 20093.78, nameDest: "C945992192", oldbalanceDest: 0.0, newbalanceDest: 234417.22, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 75, entity_id: 0, label_isFraud: 0, step: 324, type: "CASH_IN", amount: 193158.4, nameOrig: "C1226416401", oldbalanceOrg: 3269478.7, newbalanceOrig: 3462637.1, nameDest: "C1149979218", oldbalanceDest: 403390.11, newbalanceDest: 210231.71, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 76, entity_id: 0, label_isFraud: 0, step: 20, type: "PAYMENT", amount: 8289.82, nameOrig: "C470026819", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1444711038", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 77, entity_id: 0, label_isFraud: 0, step: 225, type: "CASH_IN", amount: 60739.51, nameOrig: "C1474875900", oldbalanceOrg: 20396.0, newbalanceOrig: 81135.51, nameDest: "C900564849", oldbalanceDest: 163949.85, newbalanceDest: 103210.34, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 78, entity_id: 0, label_isFraud: 0, step: 139, type: "PAYMENT", amount: 7863.96, nameOrig: "C791085580", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1965030138", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 79, entity_id: 0, label_isFraud: 0, step: 281, type: "CASH_IN", amount: 177725.46, nameOrig: "C1094590440", oldbalanceOrg: 10881760.05, newbalanceOrig: 11059485.51, nameDest: "C1087298279", oldbalanceDest: 391465.48, newbalanceDest: 213740.02, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 80, entity_id: 0, label_isFraud: 0, step: 18, type: "CASH_IN", amount: 179312.76, nameOrig: "C850125445", oldbalanceOrg: 7482540.86, newbalanceOrig: 7661853.63, nameDest: "C816706985", oldbalanceDest: 349875.6, newbalanceDest: 170562.84, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 81, entity_id: 0, label_isFraud: 0, step: 237, type: "PAYMENT", amount: 7748.33, nameOrig: "C642927540", oldbalanceOrg: 8061.0, newbalanceOrig: 312.67, nameDest: "M1343750403", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 82, entity_id: 0, label_isFraud: 1, step: 424, type: "CASH_OUT", amount: 158245.65, nameOrig: "C377182011", oldbalanceOrg: 158245.65, newbalanceOrig: 0.0, nameDest: "C418687404", oldbalanceDest: 474628.91, newbalanceDest: 632874.55, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 17},
  {link_id: 83, entity_id: 0, label_isFraud: 1, step: 165, type: "CASH_OUT", amount: 1869237.83, nameOrig: "C2081856005", oldbalanceOrg: 1869237.83, newbalanceOrig: 0.0, nameDest: "C173077042", oldbalanceDest: 472924.32, newbalanceDest: 2342162.15, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 84, entity_id: 0, label_isFraud: 1, step: 689, type: "TRANSFER", amount: 2163012.63, nameOrig: "C94303206", oldbalanceOrg: 2163012.63, newbalanceOrig: 0.0, nameDest: "C1258619985", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 28},
  {link_id: 85, entity_id: 0, label_isFraud: 1, step: 336, type: "CASH_OUT", amount: 15560.34, nameOrig: "C1454695063", oldbalanceOrg: 15560.34, newbalanceOrig: 0.0, nameDest: "C1691293574", oldbalanceDest: 1013358.63, newbalanceDest: 1028918.97, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 86, entity_id: 0, label_isFraud: 0, step: 9, type: "CASH_OUT", amount: 397265.61, nameOrig: "C583827903", oldbalanceOrg: 5846.0, newbalanceOrig: 0.0, nameDest: "C409956115", oldbalanceDest: 1343239.87, newbalanceDest: 2951328.35, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 87, entity_id: 0, label_isFraud: 0, step: 132, type: "CASH_IN", amount: 270739.51, nameOrig: "C84552620", oldbalanceOrg: 3031954.72, newbalanceOrig: 3302694.23, nameDest: "C204742222", oldbalanceDest: 2653428.11, newbalanceDest: 2382688.6, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 88, entity_id: 0, label_isFraud: 0, step: 21, type: "TRANSFER", amount: 316716.08, nameOrig: "C579493826", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1538961175", oldbalanceDest: 1451046.21, newbalanceDest: 1767762.29, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 89, entity_id: 0, label_isFraud: 0, step: 18, type: "CASH_IN", amount: 95433.63, nameOrig: "C415612181", oldbalanceOrg: 10915147.5, newbalanceOrig: 11010581.13, nameDest: "C475226701", oldbalanceDest: 3291456.6, newbalanceDest: 3196022.97, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 90, entity_id: 0, label_isFraud: 0, step: 229, type: "CASH_OUT", amount: 336185.77, nameOrig: "C755610034", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C95842980", oldbalanceDest: 628771.86, newbalanceDest: 964957.63, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 91, entity_id: 0, label_isFraud: 0, step: 260, type: "CASH_OUT", amount: 98574.44, nameOrig: "C2077253860", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1305721721", oldbalanceDest: 879050.12, newbalanceDest: 977624.56, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 92, entity_id: 0, label_isFraud: 0, step: 155, type: "PAYMENT", amount: 5794.97, nameOrig: "C920016670", oldbalanceOrg: 430.0, newbalanceOrig: 0.0, nameDest: "M1080467772", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 93, entity_id: 0, label_isFraud: 1, step: 452, type: "TRANSFER", amount: 63262.94, nameOrig: "C1275005774", oldbalanceOrg: 63262.94, newbalanceOrig: 0.0, nameDest: "C1128985646", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 18},
  {link_id: 94, entity_id: 0, label_isFraud: 1, step: 171, type: "TRANSFER", amount: 1777674.32, nameOrig: "C847645948", oldbalanceOrg: 1777674.32, newbalanceOrig: 0.0, nameDest: "C269162612", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 95, entity_id: 0, label_isFraud: 1, step: 337, type: "TRANSFER", amount: 88748.63, nameOrig: "C1144789769", oldbalanceOrg: 88748.63, newbalanceOrig: 0.0, nameDest: "C655242288", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 96, entity_id: 0, label_isFraud: 0, step: 138, type: "CASH_OUT", amount: 96188.39, nameOrig: "C1589369736", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1340455078", oldbalanceDest: 2833045.39, newbalanceDest: 2929233.78, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 97, entity_id: 0, label_isFraud: 0, step: 11, type: "TRANSFER", amount: 2204856.84, nameOrig: "C1092514922", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C75876659", oldbalanceDest: 3287220.61, newbalanceDest: 5559694.61, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 98, entity_id: 0, label_isFraud: 1, step: 529, type: "CASH_OUT", amount: 1679154.56, nameOrig: "C355424107", oldbalanceOrg: 1679154.56, newbalanceOrig: 0.0, nameDest: "C318965454", oldbalanceDest: 4351406.23, newbalanceDest: 6030560.79, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 22},
  {link_id: 99, entity_id: 0, label_isFraud: 1, step: 205, type: "CASH_OUT", amount: 566156.42, nameOrig: "C1435381938", oldbalanceOrg: 566156.42, newbalanceOrig: 0.0, nameDest: "C499232658", oldbalanceDest: 175341.4, newbalanceDest: 741497.82, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 100, entity_id: 0, label_isFraud: 0, step: 256, type: "TRANSFER", amount: 735936.6, nameOrig: "C1665408135", oldbalanceOrg: 20317.0, newbalanceOrig: 0.0, nameDest: "C1554670704", oldbalanceDest: 265827.74, newbalanceDest: 1001764.34, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 101, entity_id: 0, label_isFraud: 1, step: 125, type: "TRANSFER", amount: 8097183.22, nameOrig: "C2047670192", oldbalanceOrg: 8097183.22, newbalanceOrig: 0.0, nameDest: "C1601626536", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 102, entity_id: 0, label_isFraud: 0, step: 183, type: "CASH_OUT", amount: 150365.05, nameOrig: "C367817679", oldbalanceOrg: 42461.0, newbalanceOrig: 0.0, nameDest: "C1422018483", oldbalanceDest: 0.0, newbalanceDest: 150365.05, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 103, entity_id: 0, label_isFraud: 0, step: 349, type: "PAYMENT", amount: 34760.56, nameOrig: "C637508008", oldbalanceOrg: 29289.7, newbalanceOrig: 0.0, nameDest: "M1902611081", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 104, entity_id: 0, label_isFraud: 0, step: 681, type: "CASH_IN", amount: 55935.08, nameOrig: "C166991229", oldbalanceOrg: 1538.0, newbalanceOrig: 57473.08, nameDest: "C486333221", oldbalanceDest: 139649.37, newbalanceDest: 83714.28, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 28},
  {link_id: 105, entity_id: 0, label_isFraud: 0, step: 358, type: "CASH_OUT", amount: 93799.46, nameOrig: "C1272563009", oldbalanceOrg: 21411.0, newbalanceOrig: 0.0, nameDest: "C1118213727", oldbalanceDest: 2003617.36, newbalanceDest: 2097416.82, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 106, entity_id: 0, label_isFraud: 0, step: 9, type: "CASH_OUT", amount: 218919.61, nameOrig: "C1463233837", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1992098750", oldbalanceDest: 419452.02, newbalanceDest: 638371.63, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 107, entity_id: 0, label_isFraud: 0, step: 382, type: "PAYMENT", amount: 12235.16, nameOrig: "C755926136", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M484753575", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 108, entity_id: 0, label_isFraud: 0, step: 12, type: "CASH_IN", amount: 314553.94, nameOrig: "C1436341085", oldbalanceOrg: 21183.0, newbalanceOrig: 335736.94, nameDest: "C2035145536", oldbalanceDest: 7421752.5, newbalanceDest: 8271851.46, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 109, entity_id: 0, label_isFraud: 1, step: 71, type: "TRANSFER", amount: 304085.48, nameOrig: "C378617827", oldbalanceOrg: 304085.48, newbalanceOrig: 0.0, nameDest: "C1265131322", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 2},
  {link_id: 110, entity_id: 0, label_isFraud: 0, step: 326, type: "PAYMENT", amount: 28533.55, nameOrig: "C495928683", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M541917214", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 111, entity_id: 0, label_isFraud: 0, step: 10, type: "TRANSFER", amount: 762594.6, nameOrig: "C793887260", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C420762376", oldbalanceDest: 2716785.65, newbalanceDest: 5205572.9, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 112, entity_id: 0, label_isFraud: 0, step: 95, type: "PAYMENT", amount: 1026.6, nameOrig: "C1202737194", oldbalanceOrg: 74734.0, newbalanceOrig: 73707.4, nameDest: "M1648690602", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 3},
  {link_id: 113, entity_id: 0, label_isFraud: 1, step: 40, type: "TRANSFER", amount: 20314.97, nameOrig: "C776336653", oldbalanceOrg: 20314.97, newbalanceOrig: 0.0, nameDest: "C737099940", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 114, entity_id: 0, label_isFraud: 1, step: 291, type: "CASH_OUT", amount: 1185157.78, nameOrig: "C1347068790", oldbalanceOrg: 1185157.78, newbalanceOrig: 0.0, nameDest: "C726467776", oldbalanceDest: 0.0, newbalanceDest: 1185157.78, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 115, entity_id: 0, label_isFraud: 1, step: 701, type: "TRANSFER", amount: 8537861.24, nameOrig: "C601921404", oldbalanceOrg: 8537861.24, newbalanceOrig: 0.0, nameDest: "C1092111599", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 29},
  {link_id: 116, entity_id: 0, label_isFraud: 0, step: 334, type: "CASH_IN", amount: 4394.47, nameOrig: "C1625341443", oldbalanceOrg: 6139219.17, newbalanceOrig: 6143613.64, nameDest: "C1511379535", oldbalanceDest: 19034.92, newbalanceDest: 14640.45, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 117, entity_id: 0, label_isFraud: 0, step: 403, type: "CASH_OUT", amount: 110383.97, nameOrig: "C1057067438", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1850733047", oldbalanceDest: 3926636.46, newbalanceDest: 4037020.43, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 118, entity_id: 0, label_isFraud: 0, step: 369, type: "DEBIT", amount: 3589.28, nameOrig: "C493898217", oldbalanceOrg: 25551.0, newbalanceOrig: 21961.72, nameDest: "C1004083601", oldbalanceDest: 1157797.25, newbalanceDest: 1161386.53, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 119, entity_id: 0, label_isFraud: 0, step: 347, type: "CASH_OUT", amount: 204236.65, nameOrig: "C1310413203", oldbalanceOrg: 21314.0, newbalanceOrig: 0.0, nameDest: "C1263327636", oldbalanceDest: 0.0, newbalanceDest: 204236.65, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 120, entity_id: 0, label_isFraud: 0, step: 394, type: "CASH_IN", amount: 90071.93, nameOrig: "C1325879608", oldbalanceOrg: 6077884.31, newbalanceOrig: 6167956.24, nameDest: "C1777678598", oldbalanceDest: 2820809.83, newbalanceDest: 2730737.9, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 121, entity_id: 0, label_isFraud: 0, step: 587, type: "CASH_IN", amount: 866.28, nameOrig: "C2001974775", oldbalanceOrg: 1120653.84, newbalanceOrig: 1121520.12, nameDest: "C110753720", oldbalanceDest: 5236147.73, newbalanceDest: 5235281.45, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 24},
  {link_id: 122, entity_id: 0, label_isFraud: 0, step: 180, type: "CASH_OUT", amount: 273667.79, nameOrig: "C779619452", oldbalanceOrg: 34125.0, newbalanceOrig: 0.0, nameDest: "C1423416165", oldbalanceDest: 648274.3, newbalanceDest: 921942.09, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 123, entity_id: 0, label_isFraud: 0, step: 138, type: "TRANSFER", amount: 276740.72, nameOrig: "C665110158", oldbalanceOrg: 2096.0, newbalanceOrig: 0.0, nameDest: "C803973363", oldbalanceDest: 68102.68, newbalanceDest: 344843.4, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 124, entity_id: 0, label_isFraud: 1, step: 607, type: "TRANSFER", amount: 243348.28, nameOrig: "C549929382", oldbalanceOrg: 243348.28, newbalanceOrig: 0.0, nameDest: "C897010793", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 25},
  {link_id: 125, entity_id: 0, label_isFraud: 0, step: 690, type: "CASH_OUT", amount: 228382.54, nameOrig: "C1512369905", oldbalanceOrg: 105538.0, newbalanceOrig: 0.0, nameDest: "C662504493", oldbalanceDest: 0.0, newbalanceDest: 228382.54, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 28},
  {link_id: 126, entity_id: 0, label_isFraud: 0, step: 298, type: "PAYMENT", amount: 35950.92, nameOrig: "C914636388", oldbalanceOrg: 66550.0, newbalanceOrig: 30599.08, nameDest: "M985238609", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 127, entity_id: 0, label_isFraud: 1, step: 730, type: "CASH_OUT", amount: 2154005.71, nameOrig: "C1514500854", oldbalanceOrg: 2154005.71, newbalanceOrig: 0.0, nameDest: "C1368085881", oldbalanceDest: 0.0, newbalanceDest: 2154005.71, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 30},
  {link_id: 128, entity_id: 0, label_isFraud: 0, step: 13, type: "CASH_OUT", amount: 436482.3, nameOrig: "C1663889978", oldbalanceOrg: 31568.0, newbalanceOrig: 0.0, nameDest: "C951206487", oldbalanceDest: 191141.05, newbalanceDest: 627623.35, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 129, entity_id: 0, label_isFraud: 0, step: 283, type: "CASH_OUT", amount: 67141.83, nameOrig: "C1174829155", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C560094777", oldbalanceDest: 2019541.79, newbalanceDest: 2086683.62, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 130, entity_id: 0, label_isFraud: 0, step: 378, type: "PAYMENT", amount: 2057.12, nameOrig: "C1566092851", oldbalanceOrg: 207461.0, newbalanceOrig: 205403.88, nameDest: "M700227105", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 131, entity_id: 0, label_isFraud: 0, step: 304, type: "PAYMENT", amount: 11468.56, nameOrig: "C1199129356", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M883321085", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 132, entity_id: 0, label_isFraud: 0, step: 37, type: "PAYMENT", amount: 3071.45, nameOrig: "C268287346", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1048669747", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 133, entity_id: 0, label_isFraud: 1, step: 618, type: "CASH_OUT", amount: 1743864.1, nameOrig: "C1063377815", oldbalanceOrg: 1743864.1, newbalanceOrig: 0.0, nameDest: "C674523745", oldbalanceDest: 145959.55, newbalanceDest: 1889823.65, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 25},
  {link_id: 134, entity_id: 0, label_isFraud: 1, step: 613, type: "TRANSFER", amount: 327791.14, nameOrig: "C1234242622", oldbalanceOrg: 327791.14, newbalanceOrig: 0.0, nameDest: "C1163640582", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 25},
  {link_id: 135, entity_id: 0, label_isFraud: 0, step: 301, type: "CASH_OUT", amount: 102035.44, nameOrig: "C1136448739", oldbalanceOrg: 3054.0, newbalanceOrig: 0.0, nameDest: "C2139606278", oldbalanceDest: 225774.68, newbalanceDest: 327810.13, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 136, entity_id: 0, label_isFraud: 0, step: 155, type: "PAYMENT", amount: 35336.4, nameOrig: "C1982372097", oldbalanceOrg: 164788.53, newbalanceOrig: 129452.13, nameDest: "M174839704", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 137, entity_id: 0, label_isFraud: 0, step: 346, type: "CASH_IN", amount: 237313.92, nameOrig: "C696342756", oldbalanceOrg: 8298967.16, newbalanceOrig: 8536281.08, nameDest: "C1711866495", oldbalanceDest: 296893.97, newbalanceDest: 59580.05, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 138, entity_id: 0, label_isFraud: 0, step: 187, type: "CASH_OUT", amount: 89285.95, nameOrig: "C530800089", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1209667769", oldbalanceDest: 2374527.8, newbalanceDest: 2304984.97, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 139, entity_id: 0, label_isFraud: 0, step: 205, type: "CASH_OUT", amount: 187930.28, nameOrig: "C1739966723", oldbalanceOrg: 51345.0, newbalanceOrig: 0.0, nameDest: "C440045161", oldbalanceDest: 0.0, newbalanceDest: 187930.28, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 140, entity_id: 0, label_isFraud: 0, step: 35, type: "CASH_IN", amount: 98760.69, nameOrig: "C780865167", oldbalanceOrg: 83426.04, newbalanceOrig: 182186.73, nameDest: "C1180474362", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 141, entity_id: 0, label_isFraud: 0, step: 19, type: "PAYMENT", amount: 1882.97, nameOrig: "C975876171", oldbalanceOrg: 121106.81, newbalanceOrig: 119223.84, nameDest: "M1336781959", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 142, entity_id: 0, label_isFraud: 0, step: 396, type: "CASH_IN", amount: 15150.49, nameOrig: "C1088448264", oldbalanceOrg: 5706815.16, newbalanceOrig: 5721965.65, nameDest: "C1481135290", oldbalanceDest: 1672176.94, newbalanceDest: 1657026.45, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 143, entity_id: 0, label_isFraud: 0, step: 138, type: "PAYMENT", amount: 3104.64, nameOrig: "C622132582", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1278179860", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 144, entity_id: 0, label_isFraud: 1, step: 79, type: "CASH_OUT", amount: 1619331.51, nameOrig: "C1899697178", oldbalanceOrg: 1619331.51, newbalanceOrig: 0.0, nameDest: "C553920581", oldbalanceDest: 0.0, newbalanceDest: 1619331.51, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 3},
  {link_id: 145, entity_id: 0, label_isFraud: 0, step: 138, type: "PAYMENT", amount: 18001.21, nameOrig: "C195987954", oldbalanceOrg: 30071.0, newbalanceOrig: 12069.79, nameDest: "M1707887475", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 146, entity_id: 0, label_isFraud: 0, step: 130, type: "PAYMENT", amount: 8407.07, nameOrig: "C28943252", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M2006588997", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 147, entity_id: 0, label_isFraud: 0, step: 166, type: "PAYMENT", amount: 2754.52, nameOrig: "C1015677646", oldbalanceOrg: 204436.0, newbalanceOrig: 201681.48, nameDest: "M542506559", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 148, entity_id: 0, label_isFraud: 0, step: 191, type: "CASH_IN", amount: 160309.5, nameOrig: "C1656780051", oldbalanceOrg: 20495003.44, newbalanceOrig: 20655312.93, nameDest: "C1163897234", oldbalanceDest: 484228.02, newbalanceDest: 323918.53, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 149, entity_id: 0, label_isFraud: 0, step: 332, type: "CASH_IN", amount: 169817.18, nameOrig: "C1706976953", oldbalanceOrg: 1863.99, newbalanceOrig: 171681.18, nameDest: "C227726310", oldbalanceDest: 184061.17, newbalanceDest: 14243.99, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 150, entity_id: 0, label_isFraud: 0, step: 9, type: "CASH_OUT", amount: 324830.02, nameOrig: "C332390718", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1284149862", oldbalanceDest: 2341581.23, newbalanceDest: 2666411.25, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 151, entity_id: 0, label_isFraud: 1, step: 377, type: "CASH_OUT", amount: 434006.52, nameOrig: "C934940485", oldbalanceOrg: 434006.52, newbalanceOrig: 0.0, nameDest: "C534184245", oldbalanceDest: 1381449.3, newbalanceDest: 1815455.82, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 152, entity_id: 0, label_isFraud: 1, step: 156, type: "TRANSFER", amount: 822361.52, nameOrig: "C2086963395", oldbalanceOrg: 822361.52, newbalanceOrig: 0.0, nameDest: "C1551302836", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 153, entity_id: 0, label_isFraud: 1, step: 97, type: "CASH_OUT", amount: 5624.02, nameOrig: "C690034207", oldbalanceOrg: 5624.02, newbalanceOrig: 0.0, nameDest: "C1902968473", oldbalanceDest: 204072.3, newbalanceDest: 209696.33, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 4},
  {link_id: 154, entity_id: 0, label_isFraud: 1, step: 132, type: "CASH_OUT", amount: 768520.15, nameOrig: "C1376162995", oldbalanceOrg: 768520.15, newbalanceOrig: 0.0, nameDest: "C471258515", oldbalanceDest: 218306.5, newbalanceDest: 986826.65, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 155, entity_id: 0, label_isFraud: 0, step: 229, type: "CASH_IN", amount: 96363.11, nameOrig: "C159003281", oldbalanceOrg: 1796934.72, newbalanceOrig: 1893297.84, nameDest: "C1983595443", oldbalanceDest: 9851288.34, newbalanceDest: 9754925.22, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 156, entity_id: 0, label_isFraud: 0, step: 396, type: "CASH_IN", amount: 60284.94, nameOrig: "C785088802", oldbalanceOrg: 7766193.67, newbalanceOrig: 7826478.61, nameDest: "C111768711", oldbalanceDest: 263540.08, newbalanceDest: 203255.14, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 157, entity_id: 0, label_isFraud: 0, step: 43, type: "CASH_OUT", amount: 200365.15, nameOrig: "C536395308", oldbalanceOrg: 46200.0, newbalanceOrig: 0.0, nameDest: "C1047031032", oldbalanceDest: 150176.7, newbalanceDest: 350541.84, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 158, entity_id: 0, label_isFraud: 0, step: 203, type: "CASH_OUT", amount: 92917.08, nameOrig: "C1746653010", oldbalanceOrg: 97801.0, newbalanceOrig: 4883.92, nameDest: "C1206749493", oldbalanceDest: 0.0, newbalanceDest: 92917.08, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 159, entity_id: 0, label_isFraud: 1, step: 179, type: "TRANSFER", amount: 1494831.65, nameOrig: "C1705883896", oldbalanceOrg: 1494831.65, newbalanceOrig: 0.0, nameDest: "C258215915", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 160, entity_id: 0, label_isFraud: 0, step: 18, type: "TRANSFER", amount: 1697127.48, nameOrig: "C736805271", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C361663108", oldbalanceDest: 3325251.94, newbalanceDest: 5022379.42, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 161, entity_id: 0, label_isFraud: 0, step: 371, type: "PAYMENT", amount: 5513.33, nameOrig: "C2118384348", oldbalanceOrg: 59348.0, newbalanceOrig: 53834.67, nameDest: "M1117985741", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 162, entity_id: 0, label_isFraud: 0, step: 44, type: "PAYMENT", amount: 7938.84, nameOrig: "C1227489325", oldbalanceOrg: 10278.0, newbalanceOrig: 2339.16, nameDest: "M662607968", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 163, entity_id: 0, label_isFraud: 1, step: 590, type: "CASH_OUT", amount: 498183.25, nameOrig: "C104610866", oldbalanceOrg: 498183.25, newbalanceOrig: 0.0, nameDest: "C1054580696", oldbalanceDest: 107993.04, newbalanceDest: 606176.29, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 24},
  {link_id: 164, entity_id: 0, label_isFraud: 1, step: 250, type: "TRANSFER", amount: 156039.36, nameOrig: "C1442710040", oldbalanceOrg: 156039.36, newbalanceOrig: 0.0, nameDest: "C1844625482", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 165, entity_id: 0, label_isFraud: 1, step: 86, type: "TRANSFER", amount: 88649.1, nameOrig: "C1043173812", oldbalanceOrg: 88649.1, newbalanceOrig: 0.0, nameDest: "C1425524479", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 3},
  {link_id: 166, entity_id: 0, label_isFraud: 0, step: 163, type: "CASH_IN", amount: 335527.09, nameOrig: "C1628827866", oldbalanceOrg: 2431169.3, newbalanceOrig: 2766696.39, nameDest: "C1175711186", oldbalanceDest: 485228.09, newbalanceDest: 149701.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 167, entity_id: 0, label_isFraud: 1, step: 361, type: "TRANSFER", amount: 1082308.05, nameOrig: "C39420818", oldbalanceOrg: 1082308.05, newbalanceOrig: 0.0, nameDest: "C105774839", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 15},
  {link_id: 168, entity_id: 0, label_isFraud: 1, step: 340, type: "TRANSFER", amount: 4896179.38, nameOrig: "C1482401390", oldbalanceOrg: 4896179.38, newbalanceOrig: 0.0, nameDest: "C1010534882", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 14},
  {link_id: 169, entity_id: 0, label_isFraud: 0, step: 396, type: "CASH_IN", amount: 113737.35, nameOrig: "C1103826541", oldbalanceOrg: 1075788.98, newbalanceOrig: 1189526.33, nameDest: "C672747405", oldbalanceDest: 3064863.16, newbalanceDest: 2951125.8, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 170, entity_id: 0, label_isFraud: 0, step: 210, type: "PAYMENT", amount: 12025.11, nameOrig: "C2009456615", oldbalanceOrg: 11371.0, newbalanceOrig: 0.0, nameDest: "M1285368718", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 171, entity_id: 0, label_isFraud: 0, step: 617, type: "CASH_OUT", amount: 109669.12, nameOrig: "C1335215128", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C1824306774", oldbalanceDest: 283244.98, newbalanceDest: 392914.1, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 25},
  {link_id: 172, entity_id: 0, label_isFraud: 0, step: 209, type: "CASH_IN", amount: 164401.15, nameOrig: "C195723616", oldbalanceOrg: 208068.0, newbalanceOrig: 372469.15, nameDest: "C1411840028", oldbalanceDest: 768021.19, newbalanceDest: 603620.04, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 173, entity_id: 0, label_isFraud: 0, step: 404, type: "PAYMENT", amount: 2981.99, nameOrig: "C412398273", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "M1561708343", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 174, entity_id: 0, label_isFraud: 0, step: 34, type: "CASH_OUT", amount: 159584.08, nameOrig: "C950237159", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C97729653", oldbalanceDest: 3453403.72, newbalanceDest: 3785945.27, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 175, entity_id: 0, label_isFraud: 0, step: 210, type: "CASH_IN", amount: 101523.41, nameOrig: "C909691134", oldbalanceOrg: 2643640.45, newbalanceOrig: 2745163.86, nameDest: "C1146146269", oldbalanceDest: 197992.94, newbalanceDest: 96469.53, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 8},
  {link_id: 176, entity_id: 0, label_isFraud: 0, step: 329, type: "CASH_OUT", amount: 282960.67, nameOrig: "C1550109168", oldbalanceOrg: 51772.0, newbalanceOrig: 0.0, nameDest: "C396148165", oldbalanceDest: 16161292.14, newbalanceDest: 16444252.82, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 177, entity_id: 0, label_isFraud: 1, step: 274, type: "TRANSFER", amount: 379057.93, nameOrig: "C1259154516", oldbalanceOrg: 379057.93, newbalanceOrig: 0.0, nameDest: "C605861761", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 178, entity_id: 0, label_isFraud: 0, step: 306, type: "CASH_OUT", amount: 331956.63, nameOrig: "C133658522", oldbalanceOrg: 27111.0, newbalanceOrig: 0.0, nameDest: "C755403549", oldbalanceDest: 170551.79, newbalanceDest: 502508.42, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 12},
  {link_id: 179, entity_id: 0, label_isFraud: 1, step: 580, type: "CASH_OUT", amount: 835770.84, nameOrig: "C928957738", oldbalanceOrg: 835770.84, newbalanceOrig: 0.0, nameDest: "C1615749242", oldbalanceDest: 1490979.17, newbalanceDest: 2326750.01, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 24},
  {link_id: 180, entity_id: 0, label_isFraud: 0, step: 225, type: "CASH_IN", amount: 148040.98, nameOrig: "C1154452378", oldbalanceOrg: 5783136.62, newbalanceOrig: 5931177.6, nameDest: "C1664790150", oldbalanceDest: 215232.27, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 9},
  {link_id: 181, entity_id: 0, label_isFraud: 0, step: 187, type: "CASH_IN", amount: 98615.93, nameOrig: "C1026586339", oldbalanceOrg: 14459.0, newbalanceOrig: 113074.93, nameDest: "C1427686474", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 7},
  {link_id: 182, entity_id: 0, label_isFraud: 1, step: 19, type: "TRANSFER", amount: 10000000.0, nameOrig: "C416779475", oldbalanceOrg: 11861008.32, newbalanceOrig: 1861008.32, nameDest: "C380259496", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 183, entity_id: 0, label_isFraud: 0, step: 11, type: "CASH_OUT", amount: 551366.93, nameOrig: "C127090726", oldbalanceOrg: 379262.84, newbalanceOrig: 0.0, nameDest: "C883841715", oldbalanceDest: 1599351.88, newbalanceDest: 2672567.09, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 184, entity_id: 0, label_isFraud: 0, step: 133, type: "TRANSFER", amount: 916136.11, nameOrig: "C1953923751", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C640243026", oldbalanceDest: 2492163.22, newbalanceDest: 3408299.33, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 185, entity_id: 0, label_isFraud: 1, step: 90, type: "TRANSFER", amount: 1182557.97, nameOrig: "C787624212", oldbalanceOrg: 1182557.97, newbalanceOrig: 0.0, nameDest: "C707993034", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 3},
  {link_id: 186, entity_id: 0, label_isFraud: 0, step: 131, type: "PAYMENT", amount: 19317.53, nameOrig: "C127130261", oldbalanceOrg: 187459.0, newbalanceOrig: 168141.47, nameDest: "M1196139291", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 5},
  {link_id: 187, entity_id: 0, label_isFraud: 0, step: 255, type: "PAYMENT", amount: 29987.23, nameOrig: "C558943536", oldbalanceOrg: 20056.0, newbalanceOrig: 0.0, nameDest: "M36679418", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 188, entity_id: 0, label_isFraud: 0, step: 252, type: "TRANSFER", amount: 130308.15, nameOrig: "C767616969", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C602903274", oldbalanceDest: 1116176.73, newbalanceDest: 1246484.87, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 10},
  {link_id: 189, entity_id: 0, label_isFraud: 0, step: 330, type: "CASH_IN", amount: 363343.08, nameOrig: "C1671348218", oldbalanceOrg: 724532.0, newbalanceOrig: 1087875.08, nameDest: "C860893445", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 13},
  {link_id: 190, entity_id: 0, label_isFraud: 0, step: 162, type: "CASH_IN", amount: 63968.8, nameOrig: "C318099157", oldbalanceOrg: 35624.0, newbalanceOrig: 99592.8, nameDest: "C1683047283", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 191, entity_id: 0, label_isFraud: 0, step: 280, type: "CASH_OUT", amount: 152592.97, nameOrig: "C1875982301", oldbalanceOrg: 1114.0, newbalanceOrig: 0.0, nameDest: "C264870803", oldbalanceDest: 78565.38, newbalanceDest: 231158.35, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 11},
  {link_id: 192, entity_id: 0, label_isFraud: 1, step: 399, type: "CASH_OUT", amount: 205170.29, nameOrig: "C1048601853", oldbalanceOrg: 205170.29, newbalanceOrig: 0.0, nameDest: "C1408847191", oldbalanceDest: 12555586.13, newbalanceDest: 12760756.42, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 16},
  {link_id: 193, entity_id: 0, label_isFraud: 1, step: 444, type: "TRANSFER", amount: 440581.15, nameOrig: "C1297114741", oldbalanceOrg: 440581.15, newbalanceOrig: 0.0, nameDest: "C1962820602", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 18},
  {link_id: 194, entity_id: 0, label_isFraud: 0, step: 164, type: "PAYMENT", amount: 5180.9, nameOrig: "C532886403", oldbalanceOrg: 176300.04, newbalanceOrig: 171119.14, nameDest: "M30672823", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 195, entity_id: 0, label_isFraud: 0, step: 166, type: "CASH_OUT", amount: 377870.71, nameOrig: "C481614387", oldbalanceOrg: 0.0, newbalanceOrig: 0.0, nameDest: "C44789241", oldbalanceDest: 634487.13, newbalanceDest: 1012357.83, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 6},
  {link_id: 196, entity_id: 0, label_isFraud: 1, step: 541, type: "CASH_OUT", amount: 107320.81, nameOrig: "C1750249599", oldbalanceOrg: 107320.81, newbalanceOrig: 0.0, nameDest: "C1535674446", oldbalanceDest: 289571.44, newbalanceDest: 396892.25, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 22},
  {link_id: 197, entity_id: 0, label_isFraud: 1, step: 36, type: "TRANSFER", amount: 32382.96, nameOrig: "C1291212648", oldbalanceOrg: 32382.96, newbalanceOrig: 0.0, nameDest: "C301302016", oldbalanceDest: 0.0, newbalanceDest: 0.0, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 1},
  {link_id: 198, entity_id: 0, label_isFraud: 0, step: 19, type: "CASH_OUT", amount: 67754.76, nameOrig: "C2006572673", oldbalanceOrg: 124678.07, newbalanceOrig: 56923.3, nameDest: "C1912703909", oldbalanceDest: 277737.01, newbalanceDest: 1319960.94, isFraud: 0, isFlaggedFraud: 0, tx_day_int: 0},
  {link_id: 199, entity_id: 0, label_isFraud: 1, step: 736, type: "CASH_OUT", amount: 172915.56, nameOrig: "C962323728", oldbalanceOrg: 172915.56, newbalanceOrig: 0.0, nameDest: "C1193568854", oldbalanceDest: 7674508.7, newbalanceDest: 7847424.27, isFraud: 1, isFlaggedFraud: 0, tx_day_int: 30},
];const USERNAMES = ["alicia","bchan","cnguyen","dpatel","ekim","fgarcia","zzhao","lwang","hsato","klee"];
const DEVICES = ["iPhone 15","Pixel 8","Windows 11","MacBook M2","iPad","Samsung S23"];
const IPS = ["13.7.2.40","77.21.5.8","201.16.9.99","189.54.31.4","10.2.3.7","54.202.1.12"];
const CITIES = ["London","Singapore","Sydney","Toronto","New York","Tokyo"];
const CHANNELS = ["web","mobile","api"];
const EVENT_TYPES = ["account takeover","velocity breach","impossible travel","card testing","bot spike"];
const REASONS = [
  "ip risk score high",
  "device not seen",
  "geo velocity high",
  "password resets spike",
  "failed cvv tries",
  "proxy suspected"
];
// limit to first 50 rows
realTxData = realTxData.slice(0, 50);

function riskColor(score){
  if(score>=85) return "bg-red-100 text-red-700 border-red-300";
  if(score>=65) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-slate-100 text-slate-700 border-slate-300";
}
const RiskBadge = ({score}) => (
  <span class={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${riskColor(score)}`}>Risk {score}</span>
);

const Kpi = ({title,value,sub,icon,color="blue"}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600"
  };
  
  return (
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <div class={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-slate-900">{value}</div>
          <div class="text-xs text-slate-500">{sub}</div>
        </div>
      </div>
      <div class="text-sm font-medium text-slate-700">{title}</div>
    </div>
  );
};

function App(){
  const [tab, setTab] = useState("users");
  const [userFeed, setUserFeed] = useState(()=>Array.from({length:10}, mockUserEvent));
  const [txnFeed, setTxnFeed] = useState(()=>Array.from({length:10}, mockTxnEvent));
  const [alerts, setAlerts] = useState(()=>Array.from({length:8}, mockAlert));
  const [query, setQuery] = useState("");
  const [openCase, setOpenCase] = useState(null);

  useEffect(()=>{
    const t1 = setInterval(()=> setUserFeed(f=>[mockUserEvent(),...f].slice(0,50)), 2500);
    const t2 = setInterval(()=> setTxnFeed(f=>[mockTxnEvent(),...f].slice(0,50)), 3200);
    const t3 = setInterval(()=> setAlerts(a=>[mockAlert(),...a].slice(0,80)), 7000);
    return ()=>{clearInterval(t1);clearInterval(t2);clearInterval(t3)};
  },[]);

  const filteredAlerts = useMemo(()=>{
    if(!query) return alerts;
    const q = query.toLowerCase();
    return alerts.filter(r => [r.userId, r.type, r.reason, r.channel].some(x => String(x).toLowerCase().includes(q)));
  }, [alerts, query]);


  return (
    <div class="h-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div class="p-6 space-y-6">
        {/* Enhanced Header */}
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-slate-900">Fraud Detection Dashboard</h1>
                <p class="text-slate-600 mt-1">Real-time monitoring and analysis</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={()=>{setUserFeed(Array.from({length:10}, mockUserEvent)); setTxnFeed(Array.from({length:10}, mockTxnEvent)); setAlerts(Array.from({length:8}, mockAlert));}}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Data
              </button>
              <button class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg" onClick={()=> setAlerts(a=>[mockAlert(),...a])}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Inject Alert
              </button>
            </div>
          </div>
        </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Kpi 
          title="Live Users" 
          value={userFeed.length} 
          sub="active sessions" 
          color="blue"
          icon={<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
        />
        <Kpi 
          title="Transactions" 
          value={txnFeed.length} 
          sub="processed today" 
          color="green"
          icon={<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" /></svg>}
        />
        <Kpi 
          title="Active Alerts" 
          value={alerts.length} 
          sub="requiring attention" 
          color="red"
          icon={<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
        />
        <Kpi 
          title="Risk Score" 
          value={Math.round(avg(alerts.map(a=>a.score))||0)} 
          sub="average risk" 
          color="amber"
          icon={<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
        />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Enhanced Live Feeds Section */}
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm xl:col-span-1 overflow-hidden">
          <div class="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 class="text-lg font-semibold text-slate-900">Live Activity</h3>
            </div>
            <div class="flex items-center gap-2 mt-3">
              <button onClick={()=>setTab("users")} class={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 font-medium transition-all ${tab==='users'?'bg-blue-600 text-white shadow-sm':'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Users
              </button>
              <button onClick={()=>setTab("txns")} class={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 font-medium transition-all ${tab==='txns'?'bg-blue-600 text-white shadow-sm':'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                Transactions
              </button>
            </div>
          </div>
          <div class="h-[400px] overflow-auto">
            {tab==='users' ? <UserTable rows={userFeed}/> : <TxnTable rows={txnFeed}/>} 
          </div>
        </div>

        {/* Enhanced Alerts Section */}
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm xl:col-span-2 overflow-hidden">
          <div class="bg-gradient-to-r from-red-50 to-amber-50 p-6 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">Fraud Alerts</h3>
                  <p class="text-sm text-slate-600">Real-time threat detection and analysis</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="relative">
                  <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    value={query} 
                    onChange={(e)=>setQuery(e.target.value)} 
                    placeholder="Search alerts..." 
                    class="pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                <div class="text-sm text-slate-500">
                  {filteredAlerts.length} alerts
                </div>
              </div>
            </div>
          </div>
          <div class="h-[500px] overflow-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr class="text-left text-slate-600">
                  <th class="py-4 px-4 font-medium">Alert Type</th>
                  <th class="py-4 px-4 font-medium">Risk Level</th>
                  <th class="py-4 px-4 font-medium">Description</th>
                  <th class="py-4 px-4 font-medium">User</th>
                  <th class="py-4 px-4 font-medium">Channel</th>
                  <th class="py-4 px-4 font-medium">Timestamp</th>
                  <th class="py-4 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(a => (
                  <tr key={a.id} class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="py-4 px-4">
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {a.type}
                      </span>
                    </td>
                    <td class="py-4 px-4"><RiskBadge score={a.score}/></td>
                    <td class="py-4 px-4 max-w-[300px]">
                      <div class="truncate" title={a.reason}>{a.reason}</div>
                    </td>
                    <td class="py-4 px-4 font-medium">{a.userId}</td>
                    <td class="py-4 px-4">
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 uppercase">
                        {a.channel}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-slate-500">{a.time}</td>
                    <td class="py-4 px-4 text-right">
                      <button 
                        class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm" 
                        onClick={()=> setOpenCase(a)}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* case view modal */}
      {openCase && <CaseModal record={openCase} onClose={()=>setOpenCase(null)} />}
      </div>
    </div>
  );
}

const UserTable = ({rows}) => (
  <table class="w-full text-sm">
    <thead class="sticky top-0 bg-white">
      <tr class="text-left text-slate-500">
        <th class="py-2 pr-2">User</th>
        <th class="py-2 pr-2">Event</th>
        <th class="py-2 pr-2">Channel</th>
        <th class="py-2 pr-2">Device</th>
        <th class="py-2 text-right">When</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(e => (
        <tr key={e.id} class="border-t">
          <td class="py-2 pr-2 font-medium">{e.userId}</td>
          <td class="py-2 pr-2">{e.event}</td>
          <td class="py-2 pr-2 uppercase text-xs">{e.channel}</td>
          <td class="py-2 pr-2 truncate max-w-[120px]" title={e.device}>{e.device}</td>
          <td class="py-2 pl-2 text-right text-slate-500">{e.time}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TxnTable = ({rows}) => (
  <table class="w-full text-sm">
    <thead class="sticky top-0 bg-white">
      <tr class="text-left text-slate-500">
        <th class="py-2 pr-2">Txn id</th>
        <th class="py-2 pr-2">User</th>
        <th class="py-2 pr-2">Amount</th>
        <th class="py-2 pr-2">City</th>
        <th class="py-2 text-right">When</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(t => (
        <tr key={t.id} class="border-t">
          <td class="py-2 pr-2 font-mono text-xs">{t.id}</td>
          <td class="py-2 pr-2 font-medium">{t.userId}</td>
          <td class="py-2 pr-2">${t.amount.toLocaleString()}</td>
          <td class="py-2 pr-2">{t.city}</td>
          <td class="py-2 pl-2 text-right text-slate-500">{t.time}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

function CaseModal({record, onClose}){
  const [tab, setTab] = useState("overview");
  const profile = useMemo(()=> mockProfile(record.userId), [record]);
  const txnHistory = useMemo(()=> mockTxnHistory(record.userId), [record]);
  const beh = useMemo(()=> mockBehaviorSeries(), [record]);
  const graph = useMemo(()=> mockGraph(record.userId), [record]);

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div class="relative z-10 w-[1200px] max-w-[95vw] max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Enhanced Header */}
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold">Fraud Investigation</div>
                <div class="text-slate-300">Case ID: {record.id} • {record.type}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-sm text-slate-300">Risk Score</div>
                <div class="text-2xl font-bold">{record.score}</div>
              </div>
              <div class={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${record.score >= 85 ? 'bg-red-500' : record.score >= 65 ? 'bg-amber-500' : 'bg-green-500'}`}>
                {record.score}
              </div>
              <button class="rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors" onClick={onClose}>
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Enhanced User Profile Section */}
          <div class="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div class="flex items-center gap-4 mb-6">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {initials(profile.name)}
                </div>
                <div class="flex-1">
                  <div class="text-xl font-bold text-slate-900">{profile.name}</div>
                  <div class="text-sm text-slate-600">User ID: {profile.id}</div>
                  <div class="text-xs text-slate-500 mt-1">Member since {profile.age} days</div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 gap-4">
                <div class="bg-white/70 rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-slate-700">Account Details</span>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-600">Last Login:</span>
                      <span class="font-medium">{profile.lastLogin}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Auth Failures:</span>
                      <span class={`font-medium ${profile.authFails > 3 ? 'text-red-600' : 'text-green-600'}`}>{profile.authFails}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-white/70 rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span class="text-sm font-medium text-slate-700">Devices & Network</span>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-600">Devices:</span>
                      <span class="font-medium">{profile.devices.length}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Primary IP:</span>
                      <span class="font-mono text-xs">{profile.ip}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-white/70 rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    <span class="text-sm font-medium text-slate-700">Financial Profile</span>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-600">Avg Ticket:</span>
                      <span class="font-medium">${profile.avgTicket.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Channel:</span>
                      <span class="font-medium uppercase">{profile.channel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Risk Visualization */}
              <div class="mt-6 bg-white/70 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-slate-700">Risk Assessment</span>
                  <span class={`px-2 py-1 rounded-full text-xs font-medium ${record.score >= 85 ? 'bg-red-100 text-red-700' : record.score >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {record.score >= 85 ? 'HIGH' : record.score >= 65 ? 'MEDIUM' : 'LOW'}
                  </span>
                </div>
                <div class="relative">
                  <div class="h-3 w-full rounded-full bg-slate-200">
                    <div class={`h-3 rounded-full transition-all duration-500 ${record.score >= 85 ? 'bg-red-500' : record.score >= 65 ? 'bg-amber-500' : 'bg-green-500'}`} style={{width: record.score+"%"}}></div>
                  </div>
                  <div class="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Behavior Trend Card */}
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span class="text-lg font-semibold text-slate-900">Behavior Trend</span>
              </div>
              <EnhancedMiniBars data={beh} />
              <div class="mt-3 text-xs text-slate-600">
                Risk score trend over the last 14 days
              </div>
            </div>
          </div>

          {/* Enhanced Main Content Area */}
          <div class="lg:col-span-3 space-y-6">
            {/* Enhanced Tab Navigation */}
            <div class="bg-slate-50 rounded-2xl p-2">
              <div class="flex items-center gap-1">
                {[
                  {key: 'overview', label: 'Overview', icon: '📊'},
                  {key: 'txns', label: 'Transactions', icon: '💳'},
                  {key: 'behavior', label: 'Behavior', icon: '📈'},
                  {key: 'graph', label: 'Network', icon: '🕸️'},
                  {key: 'maps', label: 'Locations', icon: '🗺️'}
                ].map(({key, label, icon}) => (
                  <button 
                    key={key} 
                    onClick={()=>setTab(key)} 
                    class={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      tab===key 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span class="text-base">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Tab Content */}
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {tab==='overview' && (
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span class="text-slate-600">Signup City</span>
                          <span class="font-medium">{profile.city}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span class="text-slate-600">Preferred Channel</span>
                          <span class="font-medium uppercase">{profile.channel}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span class="text-slate-600">Average Ticket</span>
                          <span class="font-medium">${profile.avgTicket.toLocaleString()}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span class="text-slate-600">Auth Failures (24h)</span>
                          <span class={`font-medium ${profile.authFails > 3 ? 'text-red-600' : 'text-green-600'}`}>{profile.authFails}</span>
                        </div>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold text-slate-900 mb-4">Risk Indicators</h3>
                      <div class="space-y-3">
                        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div class="flex items-center gap-2 mb-2">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span class="font-medium text-red-900">High Risk Activity</span>
                          </div>
                          <p class="text-sm text-red-700">{record.reason}</p>
                        </div>
                        <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div class="flex items-center gap-2 mb-2">
                            <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span class="font-medium text-amber-900">Channel Risk</span>
                          </div>
                          <p class="text-sm text-amber-700">Activity from {record.channel} channel</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab==='txns' && (
                <div class="p-6">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-slate-900">Transaction History</h3>
                    <div class="text-sm text-slate-500">{txnHistory.length} transactions</div>
                  </div>
                  <div class="overflow-hidden rounded-xl border border-slate-200">
                    <div class="max-h-[400px] overflow-auto">
                      <table class="w-full text-sm">
                        <thead class="sticky top-0 bg-slate-50">
                          <tr class="text-left text-slate-600">
                            <th class="py-3 px-4 font-medium">Transaction ID</th>
                            <th class="py-3 px-4 font-medium">Amount</th>
                            <th class="py-3 px-4 font-medium">Type</th>
                            <th class="py-3 px-4 font-medium">Location</th>
                            <th class="py-3 px-4 font-medium">Time</th>
                            <th class="py-3 px-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txnHistory.map(t => (
                            <tr key={t.id} class="border-t border-slate-100 hover:bg-slate-50">
                              <td class="py-3 px-4 font-mono text-xs text-slate-600">{t.id}</td>
                              <td class="py-3 px-4 font-semibold">${t.amount.toLocaleString()}</td>
                              <td class="py-3 px-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {t.kind}
                                </span>
                              </td>
                              <td class="py-3 px-4">{t.city}</td>
                              <td class="py-3 px-4 text-slate-500">{t.time}</td>
                              <td class="py-3 px-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab==='behavior' && (
                <div class="p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Behavioral Analysis</h3>
                  <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <EnhancedMiniBars data={beh} showAxis />
                    <div class="mt-4 text-sm text-slate-600">
                      Daily risk scores showing behavioral patterns and anomalies
                    </div>
                  </div>
                </div>
              )}

              {tab==='graph' && (
                <div class="p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Network Analysis</h3>
                  <div class="bg-slate-50 rounded-xl p-6">
                    <GraphPanel graph={graph} />
                    <div class="mt-4 flex items-center gap-4 text-sm text-slate-600">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>User</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Devices</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Linked Accounts</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab==='maps' && (
                <div class="p-6">
                  <MapsPanel userId={record.userId} />
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div class="bg-slate-50 rounded-2xl p-6">
              <div class="flex items-center justify-between">
                <div class="text-sm text-slate-600">
                  <span class="font-medium">Investigation Status:</span> Pending Review
                </div>
                <div class="flex items-center gap-3">
                  <button class="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark Clean
                  </button>
                  <button class="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Put in Review
                  </button>
                  <button class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Mark Fraud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({label, value}) => (
  <div>
    <div class="text-xs text-slate-500">{label}</div>
    <div class="font-medium truncate" title={value}>{value}</div>
  </div>
);

const Tr = ({field, value}) => (
  <tr class="border-t">
    <td class="py-2 px-3 w-52 text-slate-500">{field}</td>
    <td class="py-2 px-3">{value}</td>
  </tr>
);

function MiniBars({data, showAxis}){
  return (
    <div class="h-40 flex items-end gap-1">
      {data.map((d,i)=> (
        <div key={i} class="w-5 bg-indigo-200" style={{height: (d.score+10)+"%"}} title={`D${i+1}: ${d.score}`}></div>
      ))}
    </div>
  );
}

function EnhancedMiniBars({data, showAxis}){
  const maxScore = Math.max(...data.map(d => d.score));
  return (
    <div class="space-y-4">
      <div class="h-32 flex items-end gap-1">
        {data.map((d,i)=> (
          <div key={i} class="flex-1 group relative">
            <div 
              class={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                d.score >= 80 ? 'bg-red-400' : 
                d.score >= 60 ? 'bg-amber-400' : 
                d.score >= 40 ? 'bg-yellow-400' : 'bg-green-400'
              }`} 
              style={{height: `${(d.score / maxScore) * 100}%`}}
              title={`Day ${i+1}: Risk Score ${d.score}`}
            ></div>
            {showAxis && (
              <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
                {i+1}
              </div>
            )}
          </div>
        ))}
      </div>
      {showAxis && (
        <div class="flex justify-between text-xs text-slate-500 px-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      )}
    </div>
  );
}

function GraphPanel({graph}){
  const W=900, H=240;
  const cx = (i) => 120 + i*150;
  const cy = (row) => 60 + row*90;
  const nodes = [
    { id: graph.user, label: graph.user, row: 1, col: 2, kind: "user" },
    ...graph.devices.map((d,i)=>({ id:d, label:d, row:0, col:i+1, kind:"device" })),
    ...graph.accounts.map((a,i)=>({ id:a, label:a, row:2, col:i+1, kind:"account" })),
  ];
  const links = [
    ...graph.devices.map(d=>({s:d,t:graph.user})),
    ...graph.accounts.map(a=>({s:graph.user,t:a})),
  ];
  const pos = Object.fromEntries(nodes.map(n=>[n.id,{x:cx(n.col),y:cy(n.row)}]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="w-full">
      {links.map((l,i)=>(
        <line key={i} x1={pos[l.s].x} y1={pos[l.s].y} x2={pos[l.t].x} y2={pos[l.t].y} stroke="rgb(148 163 184)" strokeWidth="2" />
      ))}
      {nodes.map(n=> (
        <g key={n.id} transform={`translate(${pos[n.id].x},${pos[n.id].y})`}>
          <circle r="22" fill={n.kind==="user"?"rgb(37 99 235)": n.kind==="device"?"rgb(245 158 11)":"rgb(239 68 68)"} />
          <text textAnchor="middle" y="38" class="text-[10px] fill-slate-600">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

function MapsPanel({userId}){
  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    // Generate mock location data for the user
    const mockLocations = mockUserLocations(userId);
    setLocations(mockLocations);
  }, [userId]);

  useEffect(() => {
    if (locations.length > 0 && !map) {
      // Initialize map
      const leafletMap = L.map('map-container').setView([locations[0].lat, locations[0].lng], 10);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      // Add markers for each location
      locations.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lng])
          .addTo(leafletMap)
          .bindPopup(`
            <div class="p-2">
              <div class="font-semibold">${location.city}</div>
              <div class="text-sm text-gray-600">${location.time}</div>
              <div class="text-sm">Risk: ${location.riskScore}</div>
              <div class="text-sm">Device: ${location.device}</div>
            </div>
          `);
        
        // Color code markers based on risk
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-4 h-4 rounded-full border-2 border-white ${location.riskScore > 70 ? 'bg-red-500' : location.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        marker.setIcon(icon);
      });

      setMap(leafletMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [locations]);

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Location History</h3>
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low Risk</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Risk</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Risk</span>
          </div>
        </div>
      </div>
      
      <div id="map-container" class="w-full h-80 rounded-lg border"></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <h4 class="font-medium">Recent Locations</h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            {locations.slice(0, 5).map((loc, i) => (
              <div key={i} class="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div>
                  <div class="font-medium">{loc.city}</div>
                  <div class="text-gray-500">{loc.time}</div>
                </div>
                <div class="text-right">
                  <div class={`px-2 py-1 rounded text-xs ${loc.riskScore > 70 ? 'bg-red-100 text-red-700' : loc.riskScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    Risk {loc.riskScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div class="space-y-2">
          <h4 class="font-medium">Location Stats</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Locations:</span>
              <span class="font-medium">{locations.length}</span>
            </div>
            <div class="flex justify-between">
              <span>Unique Cities:</span>
              <span class="font-medium">{new Set(locations.map(l => l.city)).size}</span>
            </div>
            <div class="flex justify-between">
              <span>Avg Risk Score:</span>
              <span class="font-medium">{Math.round(avg(locations.map(l => l.riskScore)))}</span>
            </div>
            <div class="flex justify-between">
              <span>Last Activity:</span>
              <span class="font-medium">{locations[0]?.time || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Real data functions using CSV data
function mockUserEvent(){
  const geo = pick(realGeoData);
  const events = ["login","logout","password reset","profile update","2fa challenge","transaction","location update"];
  return { 
    id: geo.link_id.toString(), 
    userId: geo.client_id.substring(0, 10) + "...", 
    event: pick(events), 
    channel: pick(CHANNELS), 
    device: pick(DEVICES), 
    time: geo.event_time, // Using real event_time from CSV
    latitude: geo.latitude,
    longitude: geo.longitude,
    fraudScore: geo.composite_suspicion_score || Math.random() * 0.5
  };
}
function mockTxnEvent(){
  const tx = pick(realTxData);
  const geo = realGeoData.find(g => g.entity_id === tx.entity_id) || realGeoData[0];
  return { 
    id: tx.link_id.toString(), 
    userId: tx.nameOrig, 
    amount: tx.amount, 
    city: `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}`,
    time: geo.event_time, // Using real event_time from CSV
    type: tx.type,
    isFraud: tx.isFraud,
    balance: tx.newbalanceOrig
  };
}
function mockAlert(){
  const tx = pick(realTxData.filter(t => t.isFraud === 1));
  const geo = realGeoData.find(g => g.entity_id === tx.entity_id) || realGeoData.find(g => g.label_isFraud === 1);
  const score = Math.floor(60 + Math.random() * 40); // Higher scores for real fraud
  const reasons = [
    "High amount transaction",
    "Unusual location pattern", 
    "Rapid successive transactions",
    "Suspicious account behavior",
    "Geographic anomaly detected",
    "Velocity breach detected"
  ];
  return { 
    id: tx.link_id.toString(), 
    type: tx.type.toLowerCase() + " fraud", 
    score, 
    reason: pick(reasons), 
    userId: tx.nameOrig, 
    channel: pick(CHANNELS), 
    time: geo.event_time, // Using real event_time from CSV
    amount: tx.amount,
    latitude: geo.latitude,
    longitude: geo.longitude
  };
}
function mockProfile(userId){
  // Find user's transactions
  const userTxs = realTxData.filter(tx => tx.nameOrig === userId);
  const userGeo = realGeoData.filter(geo => geo.client_id === userId);
  
  // Calculate profile data from real data
  const totalAmount = userTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const avgTicket = userTxs.length > 0 ? totalAmount / userTxs.length : Math.floor(60+Math.random()*600);
  const fraudCount = userTxs.filter(tx => tx.isFraud === 1).length;
  const lastGeo = userGeo.sort((a, b) => new Date(b.event_time) - new Date(a.event_time))[0];
  
  return { 
    id: userId, 
    name: userId.substring(0, 8) + "...", 
    age: Math.floor(Math.random() * 365) + 30, // Account age in days
    lastLogin: lastGeo ? lastGeo.event_time : pick(realGeoData).event_time, // Use real timestamp
    devices: Array.from(new Set([pick(DEVICES), pick(DEVICES)])).slice(0,2), 
    ip: pick(IPS), 
    city: lastGeo ? `${lastGeo.latitude.toFixed(2)}, ${lastGeo.longitude.toFixed(2)}` : pick(CITIES), 
    channel: pick(CHANNELS), 
    avgTicket: Math.floor(avgTicket), 
    authFails: fraudCount,
    totalTransactions: userTxs.length,
    fraudRate: userTxs.length > 0 ? (fraudCount / userTxs.length * 100).toFixed(1) : 0
  };
}
function mockTxnHistory(userId){
  // Get user's transactions from real data
  const userTxs = realTxData.filter(tx => tx.nameOrig === userId).slice(0, 20);
  
  if (userTxs.length > 0) {
    return userTxs.map(tx => {
      const geo = realGeoData.find(g => g.entity_id === tx.entity_id);
      return { 
        id: tx.link_id.toString(), 
        amount: tx.amount, 
        kind: tx.type, 
        city: geo ? `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}` : "Unknown",
        time: geo ? geo.event_time : pick(realGeoData).event_time, // Use real timestamp
        isFraud: tx.isFraud,
        balance: tx.newbalanceOrig
      };
    });
  }
  
  // Fallback to real data if no user-specific transactions found
  return realTxData.slice(0, 5).map(tx => {
    const geo = realGeoData.find(g => g.entity_id === tx.entity_id);
    return { 
      id: tx.link_id.toString(), 
      amount: tx.amount, 
      kind: tx.type, 
      city: geo ? `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}` : "Unknown",
      time: geo ? geo.event_time : pick(realGeoData).event_time, // Use real timestamp
      isFraud: tx.isFraud,
      balance: tx.newbalanceOrig
    };
  });
}
function mockBehaviorSeries(){
  return Array.from({length: 14}, (_,i)=> ({ d:`D${i+1}`, score: Math.floor(20+Math.random()*80) }));
}
function mockGraph(userId){
  return { user:userId, devices: Array.from(new Set([pick(DEVICES),pick(DEVICES),pick(DEVICES)])).slice(0,3), accounts: Array.from(new Set([uid(),uid(),uid()])).slice(0,3) };
}

function mockUserLocations(userId){
  // Get user's location data from real CSV data
  const userLocations = realGeoData.filter(geo => geo.client_id === userId);
  
  if (userLocations.length > 0) {
    return userLocations.map(geo => ({
      id: geo.link_id.toString(),
      userId: userId,
      city: `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}`,
      lat: geo.latitude,
      lng: geo.longitude,
      riskScore: Math.floor((geo.composite_suspicion_score || 0.5) * 100),
      device: pick(DEVICES),
      time: geo.event_time, // Using real event_time from CSV
      activity: pick(["login", "transaction", "profile_update", "password_reset"]),
      fraudLabel: geo.label_isFraud
    })).sort((a, b) => new Date(b.time) - new Date(a.time));
  }
  
  // Fallback to real coordinates but random selection if no user-specific data
  return realGeoData.slice(0, 10).map((geo, i) => ({
    id: geo.link_id.toString(),
    userId: userId,
    city: `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}`,
    lat: geo.latitude,
    lng: geo.longitude,
    riskScore: Math.floor((geo.composite_suspicion_score || 0.5) * 100),
    device: pick(DEVICES),
    time: geo.event_time, // Using real event_time from CSV
    activity: pick(["login", "transaction", "profile_update", "password_reset"]),
    fraudLabel: geo.label_isFraud
  }));
}

function initials(name="U"){ return name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase(); }
function avg(xs){ return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
