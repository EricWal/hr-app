import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Dimensions,
  PanResponder,
} from "react-native";
import { useRouter } from "expo-router";
import { useRequests } from "../../../context/RequestsContext";
import { colors } from "../../../constants/colors";
import { fonts } from "../../../constants/fonts";

const { width } = Dimensions.get("window");

function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function timeToString(hour, minute, ampm, tz) {
  let h = hour % 12;
  if (ampm === "PM") h += 12;
  const date = new Date();
  date.setHours(h);
  date.setMinutes(minute);

  // format with locale (Arabic) and include timezone name
  const opts = { hour: "numeric", minute: "2-digit" };
  const timeStr = date.toLocaleTimeString("ar-SA", opts);
  return `${timeStr} (${tz})`;
}

// Simple signature pad using touch points (no external libs)
function SignaturePad({ onSave }) {
  const [strokes, setStrokes] = useState([]);
  const currentStroke = useRef([]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, g) => {
        const { locationX, locationY } = e.nativeEvent;
        // start a fresh stroke (use a new array reference)
        currentStroke.current = [{ x: locationX, y: locationY }];
        setStrokes((s) => [...s, currentStroke.current.slice()]);
      },
      onPanResponderMove: (e, g) => {
        const { locationX, locationY } = e.nativeEvent;
        const prev = currentStroke.current[currentStroke.current.length - 1];
        const newPoint = { x: locationX, y: locationY };
        if (prev) {
          const dx = newPoint.x - prev.x;
          const dy = newPoint.y - prev.y;
          const dist = Math.hypot(dx, dy);
          const step = 2; // px step size for interpolation
          const steps = Math.max(1, Math.floor(dist / step));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            currentStroke.current.push({
              x: prev.x + dx * t,
              y: prev.y + dy * t,
            });
          }
        } else {
          currentStroke.current.push(newPoint);
        }
        // update strokes optimistically with a copy so later clearing currentStroke doesn't affect stored strokes
        setStrokes((s) => {
          if (!currentStroke.current.length) return s;
          return s.length
            ? [...s.slice(0, -1), currentStroke.current.slice()]
            : [currentStroke.current.slice()];
        });
      },
      onPanResponderRelease: () => {
        // commit the current stroke as a copy and replace the last temp stroke (only if stroke exists)
        if (currentStroke.current.length) {
          setStrokes((s) => {
            const copy = currentStroke.current.slice();
            return [...s.slice(0, -1), copy];
          });
        }
        currentStroke.current = [];
      },
    })
  ).current;

  const clear = () => setStrokes([]);

  const save = () => {
    onSave(strokes);
  };

  return (
    <View style={sigStyles.container}>
      <View style={sigStyles.canvas} {...pan.panHandlers}>
        {strokes.map((stroke, i) => (
          <View key={i} pointerEvents="none">
            {stroke.map((p, idx) => (
              <View
                key={idx}
                style={{
                  position: "absolute",
                  left: p.x - 2,
                  top: p.y - 2,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#111",
                }}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={sigStyles.actions}>
        <Button title="مسح" onPress={clear} />
        <Button title="حفظ" onPress={save} />
      </View>
    </View>
  );
}

const sigStyles = StyleSheet.create({
  container: { marginVertical: 10 },
  canvas: {
    height: 160,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});

export default function LeaveRequest() {
  const router = useRouter();
  const { addRequest, requests } = useRequests();

  // Pre-filled read-only user info
  const [employeeName] = useState("عبيد خالد");
  const [role] = useState("موظف اداري");
  const [department] = useState("إدارة المشاريع");

  // Form state
  const [date, setDate] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [fromTimeMinutes, setFromTimeMinutes] = useState(null);
  const [toTimeMinutes, setToTimeMinutes] = useState(null);
  const [showFromTime, setShowFromTime] = useState(false);
  const [showToTime, setShowToTime] = useState(false);
  // whether toTime was auto-set based on fromTime
  const [toTimeAuto, setToTimeAuto] = useState(true);

  const [notes, setNotes] = useState("");

  const [signature, setSignature] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [selectedDayName, setSelectedDayName] = useState(null);

  // Validation / UI state
  const [errors, setErrors] = useState({});
  const [remainingMinutes, setRemainingMinutes] = useState(8 * 60); // 8 hours default
  const [remainingLeaves, setRemainingLeaves] = useState(4); // 4 leaves per month default
  const [ackChecked, setAckChecked] = useState(false);

  // timezone value
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // Date utils: current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const days = getDaysInMonth(currentYear, currentMonth);
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  // grid with leading nulls so dates align to correct weekday column (Sunday=0)
  const calendarGrid = [...Array(firstWeekday).fill(null), ...days];

  // compute remaining hours from context requests (sum of durationMinutes for 'استئذان')
  React.useEffect(() => {
    const arr = Array.isArray(requests) ? requests : [];
    const used = arr
      .filter(
        (r) => r.type === "استئذان" && typeof r.durationMinutes === "number"
      )
      .reduce((s, r) => s + (r.durationMinutes || 0), 0);
    // Count how many leave requests in the current month
    const usedCount = arr.filter(
      (r) =>
        r.type === "استئذان" &&
        typeof r.date === "string" &&
        r.date.startsWith(
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
        )
    ).length;

    setRemainingMinutes(Math.max(0, 8 * 60 - used));
    setRemainingLeaves(Math.max(0, 4 - usedCount));
  }, [requests]);

  // set default fromTime to 08:00 and auto-set toTime = from + 30min if not picked by user
  React.useEffect(() => {
    if (fromTimeMinutes == null) {
      const defaultMinutes = 8 * 60;
      // setFromTimeMinutes(defaultMinutes);
      // setFromTime(timeToString(8, 0, 'AM', timezone));
      // auto set toTime to from + 30
      const toDefault = defaultMinutes + 30;
      // setToTimeMinutes(toDefault);
      // compute display
      const th = Math.floor(toDefault / 60) % 24;
      const tm = toDefault % 60;
      const tah = th % 12 === 0 ? 12 : th % 12;
      const tampm = th >= 12 ? "PM" : "AM";
      // setToTime(timeToString(tah, tm, tampm, timezone));
      setToTimeAuto(true);
    }
  }, []);

  const onPickDay = (d) => {
    setDate(formatDate(d.getFullYear(), d.getMonth(), d.getDate()));
    // set weekday name in Arabic (e.g., الثلاثاء)
    const dayName = d.toLocaleDateString("ar-SA", { weekday: "long" });
    setSelectedDayName(dayName);
    setShowDateModal(false);
  };

  const onSaveSignature = (strokes) => {
    setSignature(strokes);
    // keep modal closed after save but allow editing again by tapping the preview
    setShowSigModal(false);
  };

  const validateAndSubmit = () => {
    const newErrors = {};

    if (!date) newErrors.date = "الرجاء اختيار التاريخ";

    if (fromTimeMinutes == null || toTimeMinutes == null) {
      newErrors.time = "اختر وقت البداية والنهاية من القائمة";
    } else {
      const dur = toTimeMinutes - fromTimeMinutes;
      if (dur <= 0) newErrors.time = "وقت النهاية يجب أن يكون بعد وقت البداية";
      else if (dur > 3 * 60)
        newErrors.time = "مدة الطلب لا يجب أن تتجاوز 3 ساعات";
      else if (dur > remainingMinutes)
        newErrors.time = "لا يوجد رصيد كافٍ لهذا المدة";
    }

    if (!signature) newErrors.signature = "يرجى توقيع النموذج";

    if (!ackChecked) newErrors.ack = "يرجى تأكيد صحة البيانات";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const durationMinutes = toTimeMinutes - fromTimeMinutes;

    const request = {
      id: Date.now(),
      type: "استئذان",
      date,
      fromTime,
      toTime,
      durationMinutes,
      notes,
      employeeName,
      role,
      department,
      signatureExists: !!signature,
      status: "قيد المراجعة",
    };

    addRequest(request);
    alert("تم إرسال الطلب بنجاح");
    router.back();
  };

  // Time picker helpers: simple numeric selectors
  function TimePicker({ visible, initial, onClose, onPick }) {
    const [hour, setHour] = useState(8);
    const [minute, setMinute] = useState(30);
    const [ampm, setAmpm] = useState("AM");

    React.useEffect(() => {
      if (initial) {
        // initial can be a display string or an object {display, minutes}
        if (
          typeof initial === "object" &&
          typeof initial.minutes === "number"
        ) {
          const total = initial.minutes;
          const h24 = Math.floor(total / 60) % 24;
          const m = total % 60;
          const isPM = h24 >= 12;
          const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
          setHour(h12);
          setMinute(m);
          setAmpm(isPM ? "PM" : "AM");
        } else if (typeof initial === "string") {
          const parts = initial.match(/(\d+):(\d+)/);
          if (parts) {
            let h = parseInt(parts[1], 10);
            let m = parseInt(parts[2], 10);
            const isPM = /(م|PM|pm)/i.test(initial);
            if (h > 12) h -= 12;
            setHour(h);
            setMinute(m);
            setAmpm(isPM ? "PM" : "AM");
          }
        }
      }
    }, [initial]);

    if (!visible) return null;

    const computeMinutes = (h, m, a) => {
      let h24 = h % 12;
      if (a === "PM") h24 += 12;
      if (a === "AM" && h === 12) h24 = 0;
      return h24 * 60 + m;
    };

    return (
      <Modal transparent animationType="slide" visible={visible}>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.sheetTitle}>اختر الوقت</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setHour((h) => (h === 1 ? 12 : h - 1))}
                style={modalStyles.btn}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={modalStyles.timeText}>
                {String(hour).padStart(2, "0")}
              </Text>
              <TouchableOpacity
                onPress={() => setHour((h) => (h === 12 ? 1 : h + 1))}
                style={modalStyles.btn}
              >
                <Text>+</Text>
              </TouchableOpacity>

              <View style={{ width: 16 }} />

              <TouchableOpacity
                onPress={() => setMinute((m) => (m === 0 ? 55 : m - 5))}
                style={modalStyles.btn}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={modalStyles.timeText}>
                {String(minute).padStart(2, "0")}
              </Text>
              <TouchableOpacity
                onPress={() => setMinute((m) => (m === 55 ? 0 : m + 5))}
                style={modalStyles.btn}
              >
                <Text>+</Text>
              </TouchableOpacity>

              <View style={{ width: 16 }} />

              <TouchableOpacity
                onPress={() => setAmpm((a) => (a === "AM" ? "PM" : "AM"))}
                style={modalStyles.ampm}
              >
                <Text>{ampm}</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <Button title="إلغاء" onPress={onClose} />
              <Button
                title="اختيار"
                onPress={() => {
                  const val = timeToString(hour, minute, ampm, timezone);
                  const minutes = computeMinutes(hour, minute, ampm);
                  onPick({ display: val, minutes });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const currentDuration =
    fromTimeMinutes != null && toTimeMinutes != null
      ? toTimeMinutes - fromTimeMinutes
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>طلب استئذان</Text>

        <Text style={styles.remaining}>
          <Text style={styles.titleBold}>ملاحظة</Text> : يحق للموظف التمتع بعدد{" "}
          <Text style={styles.titleBold}>8</Text> ساعات تقسم على{" "}
          <Text style={styles.titleBold}>4</Text> أستئذانات على ان لا يزيد
          الاستئذان عن <Text style={styles.titleBold}>3</Text> ساعات .
        </Text>

        <Text style={styles.remaining}>
          المتبقي من الاستئذان :{" "}
          <Text style={styles.titleBold}>
            {Math.floor(remainingMinutes / 60)}
          </Text>{" "}
          ساعة <Text style={styles.titleBold}>{remainingMinutes % 60}</Text>{" "}
          دقيقة {"\n"}
          <Text style={styles.titleBold}>{remainingLeaves}</Text> من{" "}
          <Text style={styles.titleBold}>4</Text> استئذانات متاحة
        </Text>

        {/* Employee info - disabled */}
        <View style={styles.rowTriple}>
          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>اسم الموظف</Text>
            <TextInput
              value={employeeName}
              editable={false}
              selectTextOnFocus={false}
              style={[styles.input, styles.disabled]}
            />
          </View>

          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>الوظيفة</Text>
            <TextInput
              value={role}
              editable={false}
              style={[styles.input, styles.disabled]}
            />
          </View>

          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>الإدارة / القسم</Text>
            <TextInput
              value={department}
              editable={false}
              style={[styles.input, styles.disabled]}
            />
          </View>
        </View>

        {/* Date picker - only current month */}
        <Text style={styles.labelSmall}>التاريخ (اختر من التقويم)</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setShowDateModal(true);
            setErrors((e) => ({ ...e, date: undefined }));
          }}
        >
          <Text
            style={{
              textAlign: "right",
              color: date ? colors.text.primary : colors.text.tertiary,
            }}
          >
            {date ? (
              `${date} - يوم : ${selectedDayName || ""}`
            ) : (
              <Text style={styles.timePlaceholderValue}>اختر التاريخ</Text>
            )}
          </Text>
        </TouchableOpacity>
        {errors.date && (
          <Text style={{ color: colors.error, marginBottom: 8 }}>
            {errors.date}
          </Text>
        )}

        <Modal visible={showDateModal} transparent animationType="slide">
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.calendar}>
              <Text style={modalStyles.sheetTitle}>
                شهر {now.toLocaleString("ar-SA", { month: "long" })}{" "}
                {currentYear}
              </Text>

              {/* Header (render right-to-left for Arabic) */}
              <View
                style={[modalStyles.weekRow, { flexDirection: "row-reverse" }]}
              >
                {[
                  "الأحد",
                  "الإثنين",
                  "الثلاثاء",
                  "الأربعاء",
                  "الخميس",
                  "الجمعة",
                  "السبت",
                ].map((d, i) => (
                  <Text key={i} style={modalStyles.weekDay}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Render calendar weeks so weekdays align correctly */}
              <View>
                {(() => {
                  const weeks = [];
                  for (let i = 0; i < calendarGrid.length; i += 7) {
                    weeks.push(calendarGrid.slice(i, i + 7));
                  }
                  return weeks.map((week, rIdx) => (
                    <View
                      key={rIdx}
                      style={[
                        modalStyles.weekRow,
                        { flexDirection: "row-reverse" },
                      ]}
                    >
                      {week.map((d, idx) => {
                        if (!d)
                          return <View key={idx} style={modalStyles.dayCell} />;

                        const dayNum = d.getDate();
                        const isSelected =
                          date ===
                          formatDate(
                            d.getFullYear(),
                            d.getMonth(),
                            d.getDate()
                          );
                        return (
                          <TouchableOpacity
                            key={d.getTime()}
                            onPress={() => onPickDay(d)}
                            style={[
                              modalStyles.dayCell,
                              isSelected && modalStyles.daySelected,
                            ]}
                          >
                            <Text
                              style={[
                                modalStyles.dayText,
                                isSelected && { color: colors.text.inverse },
                              ]}
                            >
                              {dayNum}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ));
                })()}
              </View>

              <View style={{ marginTop: 12 }}>
                <Button title="إغلاق" onPress={() => setShowDateModal(false)} />
              </View>
            </View>
          </View>
        </Modal>

        {/* Time pickers */}
        <Text style={styles.labelSmall}>وقت الاستئذان</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text
              style={[
                styles.labelSmall,
                { marginBottom: 6, textAlign: "right" },
              ]}
            >
              إلى
            </Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowToTime(true)}
            >
              <Text
                style={{
                  textAlign: "right",
                  color: toTime ? colors.text.primary : colors.text.tertiary,
                }}
              >
                {toTime || (
                  <Text style={styles.timePlaceholderValue}>
                    نهاية الاستئذان
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={[
                styles.labelSmall,
                { marginBottom: 6, textAlign: "right" },
              ]}
            >
              من
            </Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowFromTime(true)}
            >
              <Text
                style={{
                  textAlign: "right",
                  color: fromTime ? colors.text.primary : colors.text.tertiary,
                }}
              >
                {fromTime || (
                  <Text style={styles.timePlaceholderValue}>
                    بداية الاستئذان
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TimePicker
          visible={showFromTime}
          initial={
            fromTimeMinutes != null ? { minutes: fromTimeMinutes } : fromTime
          }
          onClose={() => setShowFromTime(false)}
          onPick={(v) => {
            setFromTime(v.display);
            setFromTimeMinutes(v.minutes);
            setShowFromTime(false);
            setErrors((e) => ({ ...e, time: undefined }));
          }}
        />

        <TimePicker
          visible={showToTime}
          initial={toTimeMinutes != null ? { minutes: toTimeMinutes } : toTime}
          onClose={() => setShowToTime(false)}
          onPick={(v) => {
            setToTime(v.display);
            setToTimeMinutes(v.minutes);
            setShowToTime(false);
            setToTimeAuto(false);
            setErrors((e) => ({ ...e, time: undefined }));
          }}
        />

        {errors.time && (
          <Text style={{ color: colors.error, marginBottom: 8 }}>
            {errors.time}
          </Text>
        )}

        {fromTimeMinutes !== null && toTimeMinutes !== null && (
          <View
            style={{
              backgroundColor: colors.background.subtle,
              borderRadius: 12,
              padding: 16,
              marginVertical: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.medium,
                color: colors.text.secondary,
                marginBottom: 8,
                textAlign: "right",
              }}
            >
              ملخص الطلب الحالي
            </Text>

            <Text
              style={{
                fontFamily: fonts.regular,
                color:
                  currentDuration > 3 * 60 ? colors.error : colors.text.primary,
                textAlign: "right",
              }}
            >
              • المدة المطلوبة: {Math.max(0, Math.floor(currentDuration / 60))}{" "}
              ساعة و {Math.max(0, currentDuration % 60)} دقيقة
            </Text>

            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.text.primary,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              • الرصيد المتبقي قبل الطلب: {Math.floor(remainingMinutes / 60)}{" "}
              ساعة و {remainingMinutes % 60} دقيقة
            </Text>

            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.text.primary,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              • الرصيد المتبقي بعد الطلب:{" "}
              {Math.max(
                0,
                Math.floor(
                  (remainingMinutes - (toTimeMinutes - fromTimeMinutes)) / 60
                )
              )}{" "}
              ساعة و{" "}
              {Math.max(
                0,
                (remainingMinutes - (toTimeMinutes - fromTimeMinutes)) % 60
              )}{" "}
              دقيقة
            </Text>

            {toTimeMinutes - fromTimeMinutes > remainingMinutes && (
              <Text
                style={{
                  color: colors.error,
                  marginTop: 12,
                  textAlign: "right",
                  fontFamily: fonts.medium,
                }}
              >
                ⚠️ المدة تتجاوز الرصيد المتاح — لن يتم قبول الطلب
              </Text>
            )}
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              setAckChecked((s) => !s);
              setErrors((e) => ({ ...e, ack: undefined }));
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkboxBox,
                ackChecked && { backgroundColor: colors.primary },
              ]}
            />
            <Text style={styles.checkboxLabel}>أقر بصحة البيانات</Text>
          </TouchableOpacity>
          {errors.ack && (
            <Text style={{ color: colors.error, marginTop: 6 }}>
              {errors.ack}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !ackChecked && styles.submitButtonDisabled,
          ]}
          onPress={validateAndSubmit}
          activeOpacity={0.85}
          disabled={!ackChecked}
        >
          <Text style={styles.submitText}>إرسال الطلب</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  calendar: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  weekDay: {
    width: (width - 64) / 7,
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: 12,
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  dayCell: {
    width: (width - 64) / 7,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: colors.text.primary },
  daySelected: { backgroundColor: colors.primary, borderRadius: 6 },
  btn: {
    padding: 8,
    backgroundColor: colors.background.card,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  timeText: { fontFamily: fonts.bold, fontSize: 18, marginHorizontal: 8 },
  ampm: {
    padding: 8,
    backgroundColor: colors.background.card,
    borderRadius: 6,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },
  scrollContent: { padding: 20 },
  title: {
    fontSize: 22,
    marginBottom: 6,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  remaining: {
    fontFamily: fonts.medium,
    color: colors.text.tertiary,
    marginBottom: 16,
    textAlign: "right",
  },
  rowTriple: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cellSmall: { flex: 1, marginHorizontal: 4, minWidth: 100 },
  labelSmall: {
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 6,
    textAlign: "right",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderColor: colors.border,
    backgroundColor: colors.background.subtle,
    fontFamily: fonts.regular,
    color: colors.text.primary,
  },
  disabled: { opacity: 0.6, backgroundColor: colors.background.card },
  submitButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.border,
  },
  submitText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxLabel: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
  },
  titleBold: {
    fontSize: 15,
    marginBottom: 6,
    fontFamily: fonts.bold,
    color: colors.text.primary,
  },
  timePlaceholderValue: { fontFamily: fonts.medium, fontSize: 12 },
});
