import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { currentMonthId } from "./months";
import { config as defaults } from "../data/config";

const ContentContext = createContext({
  content: defaults,
  moments: [],
  months: [],
  selectedMonthId: "",
  selectedMonth: null,
  setSelectedMonthId: () => {},
  ready: !isFirebaseConfigured,
  isRemote: isFirebaseConfigured,
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeContent(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override;
  if (!isPlainObject(base)) return override;

  const merged = { ...base };
  Object.keys(override).forEach((key) => {
    merged[key] = mergeContent(base[key], override[key]);
  });

  return merged;
}

function monthContent(month) {
  if (!isPlainObject(month)) return {};

  const {
    id,
    monthId,
    label,
    createdAt,
    updatedAt,
    partnerOne,
    partnerTwo,
    startDate,
    ...rest
  } = month;

  return rest;
}

export function ContentProvider({ children }) {
  const [remote, setRemote] = useState(null);
  const [moments, setMoments] = useState([]);
  const [monthDocs, setMonthDocs] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [siteReady, setSiteReady] = useState(!isFirebaseConfigured);
  const [monthsReady, setMonthsReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!db) return;

    const unsubscribeContent = onSnapshot(
      doc(db, "site", "main"),
      (snapshot) => {
        setRemote(snapshot.exists() ? snapshot.data() : {});
        setSiteReady(true);
      },
      (error) => {
        console.error(error);
        setSiteReady(true);
      }
    );

    const unsubscribeMoments = onSnapshot(
      query(collection(db, "moments"), orderBy("date", "desc")),
      (snapshot) => {
        setMoments(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        );
      },
      (error) => {
        console.error(error);
      }
    );

    const unsubscribeMonths = onSnapshot(
      collection(db, "site"),
      (snapshot) => {
        const list = snapshot.docs
          .filter((item) => item.id.startsWith("month-"))
          .map((item) => {
            const data = item.data();
            return {
              id: item.id,
              monthId:
                data.monthId || item.id.replace(/^month-/, ""),
              ...data,
            };
          })
          .sort((a, b) =>
            a.monthId < b.monthId ? 1 : a.monthId > b.monthId ? -1 : 0
          );

        setMonthDocs(list);
        setMonthsReady(true);
      },
      (error) => {
        console.error(error);
        setMonthsReady(true);
      }
    );

    return () => {
      unsubscribeContent();
      unsubscribeMoments();
      unsubscribeMonths();
    };
  }, []);

  useEffect(() => {
    if (!monthDocs.length) {
      if (selectedMonthId) setSelectedMonthId("");
      return;
    }

    if (selectedMonthId) return;

    const now = currentMonthId();
    const preferred =
      monthDocs.find((month) => month.monthId === now) || monthDocs[0];
    setSelectedMonthId(preferred.monthId);
  }, [monthDocs, selectedMonthId]);

  const baseContent = useMemo(
    () => mergeContent(defaults, remote || {}),
    [remote]
  );

  const selectedMonth = useMemo(
    () =>
      monthDocs.find((month) => month.monthId === selectedMonthId) || null,
    [monthDocs, selectedMonthId]
  );

  const content = useMemo(() => {
    if (!selectedMonth) return baseContent;
    return mergeContent(baseContent, monthContent(selectedMonth));
  }, [baseContent, selectedMonth]);

  const ready = siteReady && monthsReady;

  const value = useMemo(
    () => ({
      content,
      moments,
      months: monthDocs,
      selectedMonthId,
      selectedMonth,
      setSelectedMonthId,
      ready,
      isRemote: isFirebaseConfigured,
    }),
    [
      content,
      moments,
      monthDocs,
      selectedMonthId,
      selectedMonth,
      ready,
    ]
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
