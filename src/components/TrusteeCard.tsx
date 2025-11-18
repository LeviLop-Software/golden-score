/**
 * TrusteeCard - קומפוננטת תצוגה למידע על כונס נכסים / נאמן
 * 
 * מטרה: הצגת מידע על כונסי נכסים, נאמנים והליכים משפטיים קשורים
 * 
 * Props:
 * - companyId: מספר ח.פ של החברה
 * 
 * מצבים:
 * - טעינה: Spinner
 * - שגיאה: הודעת שגיאה אדומה
 * - אין נתונים: הודעה ירוקה "לא נמצאו נתונים"
 * - יש נתונים: תצוגת כרטיסים עם כל המידע
 * 
 * עיצוב:
 * - Tailwind CSS v4
 * - RTL support
 * - Responsive
 * - Hebrew typography
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TrusteeData, TrusteeInfo, LegalProcedure } from '../services/trusteeService';

interface TrusteeCardProps {
  companyId: string;
}

/**
 * תגית סטטוס צבעונית להליך משפטי
 */
const ProcedureTypeBadge: React.FC<{ type: LegalProcedure['type'] }> = ({ type }) => {
  const styles = {
    bankruptcy: 'bg-red-100 text-red-800 border-red-300',
    liquidation: 'bg-orange-100 text-orange-800 border-orange-300',
    claim: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  const labels = {
    bankruptcy: 'פשיטת רגל',
    liquidation: 'פירוק',
    claim: 'תביעת חוב',
  };

  const style = styles[type] as string;
  const label = labels[type] as string;
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${style}`}>
      {label}
    </span>
  );
};

/**
 * תגית מקור נתונים
 */
const DataSourceBadge: React.FC<{ source: 'bankruptcy' | 'liquidation' | 'claim' }> = ({ source }) => {
  const styles = {
    bankruptcy: 'bg-purple-100 text-purple-800 border-purple-300',
    liquidation: 'bg-blue-100 text-blue-800 border-blue-300',
    claim: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const labels = {
    bankruptcy: 'מאגר: חייבים בפירוק',
    liquidation: 'מאגר: חברות בפירוק',
    claim: 'מאגר: תביעות חוב',
  };
  
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${styles[source]}`}>
      {labels[source]}
    </span>
  );
};

/**
 * כרטיס להצגת פרטי כונס בודד
 */
const TrusteeInfoCard: React.FC<{ trustee: TrusteeInfo }> = ({ trustee }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
      <div className="font-bold text-lg text-blue-900 mb-2">{trustee.name}</div>
      <div className="space-y-1 text-sm text-blue-800">
        {trustee.phone && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">טלפון:</span>
            <a href={`tel:${trustee.phone}`} className="hover:underline">
              {trustee.phone}
            </a>
          </div>
        )}
        {trustee.email && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">אימייל:</span>
            <a href={`mailto:${trustee.email}`} className="hover:underline">
              {trustee.email}
            </a>
          </div>
        )}
        {trustee.appointmentDate && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">תאריך מינוי:</span>
            <span>{new Date(trustee.appointmentDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}
        {trustee.status && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">סטטוס:</span>
            <span className="font-medium">{trustee.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * כרטיס להצגת הליך משפטי בודד (פירוק / פשיטת רגל)
 */
const ProcedureCard: React.FC<{ procedure: LegalProcedure }> = ({ procedure }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ProcedureTypeBadge type={procedure.type} />
          <DataSourceBadge source={procedure.type} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{procedure.status}</span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-700">
        {procedure.fileNumber && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">מספר תיק:</span>
            <span className="font-mono">{procedure.fileNumber}</span>
          </div>
        )}
        {procedure.openingDate && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">תאריך פתיחה:</span>
            <span>{new Date(procedure.openingDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}
        {procedure.closingDate && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">תאריך סגירה:</span>
            <span>{new Date(procedure.closingDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}
        {procedure.claimant && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">תובע:</span>
            <span>{procedure.claimant}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * כרטיס מאוחד להצגת כל תביעות החוב
 */
const ClaimsCard: React.FC<{ claims: LegalProcedure[] }> = ({ claims }) => {
  const totalClaimAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalApprovedAmount = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
  
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-300">
        <div className="flex items-center gap-2">
          <ProcedureTypeBadge type="claim" />
          <span className="text-xs font-bold text-amber-900">{claims.length} תביעות</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-gray-600">תביעות: </span>
            <span className="font-bold text-amber-900">₪{totalClaimAmount.toLocaleString('he-IL')}</span>
          </div>
          <div>
            <span className="text-gray-600">אושר: </span>
            <span className="font-bold text-green-700">₪{totalApprovedAmount.toLocaleString('he-IL')}</span>
          </div>
        </div>
      </div>

      {/* טבלת תביעות קומפקטית */}
      <div className="space-y-1">
        {claims.map((claim, index) => (
          <div key={index} className="bg-white/70 border border-amber-200/60 rounded p-2 text-xs hover:bg-white transition-colors">
            <div className="flex items-center justify-between gap-2">
              {/* עמודה ימנית: מספר + פרטים */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-bold text-amber-900 shrink-0">#{index + 1}</span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium shrink-0">
                  {claim.status}
                </span>
                {claim.claimantType && (
                  <span className="text-gray-600 truncate">{claim.claimantType.trim()}</span>
                )}
                {claim.systemType && (
                  <span className="text-gray-500 text-[10px] truncate">({claim.systemType.trim()})</span>
                )}
              </div>
              
              {/* עמודה שמאלית: סכומים */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-left">
                  <div className="text-[10px] text-gray-500">תביעה</div>
                  <div className="font-bold text-amber-900">₪{(claim.amount || 0).toLocaleString('he-IL')}</div>
                </div>
                {claim.approvedAmount !== undefined && claim.approvedAmount > 0 && (
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500">אושר</div>
                    <div className="font-bold text-green-700">₪{claim.approvedAmount.toLocaleString('he-IL')}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* שורה נוספת לפרטים אם יש */}
            {(claim.fileNumber || claim.debtCreationDate) && (
              <div className="flex items-center gap-3 mt-1 pt-1 border-t border-amber-100 text-[10px] text-gray-500">
                {claim.fileNumber && (
                  <span>תיק: <span className="font-mono text-gray-700">{claim.fileNumber}</span></span>
                )}
                {claim.debtCreationDate && (
                  <span>תאריך: <span className="text-gray-700">{claim.debtCreationDate}</span></span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * הקומפוננטה הראשית
 */
export const TrusteeCard: React.FC<TrusteeCardProps> = ({ companyId }) => {
  const [data, setData] = useState<TrusteeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (!companyId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/company/${companyId}/trustee`);
        
        if (!response.ok) {
          throw new Error(`שגיאת HTTP: ${response.status}`);
        }

        const result: TrusteeData = await response.json();
        setData(result);
      } catch (err: any) {
        console.error('[TrusteeCard] Error fetching data:', err);
        setError(err.message || 'שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // מצב טעינה
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">כונס נכסים / נאמן</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // מצב שגיאה
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">כונס נכסים / נאמן</h2>
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-red-900 mb-1">שגיאה</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // אין נתונים
  if (!data || !data.hasTrustee) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">כונס נכסים / נאמן</h2>
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-green-900 mb-1">✓ הכל תקין</h3>
              <p className="text-sm text-green-800">לא נמצא כונס נכסים או נאמן עבור חברה זו</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // תצוגת נתונים מלאה
  // חישוב סטטיסטיקות לפי סוג
  const liquidationProcedures = data.procedures.filter(p => p.type === 'liquidation');
  const bankruptcyProcedures = data.procedures.filter(p => p.type === 'bankruptcy');
  const claimProcedures = data.procedures.filter(p => p.type === 'claim');
  
  const proceduresByType = {
    liquidation: liquidationProcedures.length,
    bankruptcy: bankruptcyProcedures.length,
    claim: claimProcedures.length,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* כותרת */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer mb-4 hover:opacity-80 transition-opacity"
      >
        <h2 className="text-xl font-bold text-gray-800">כונס נכסים / נאמן</h2>
        <ChevronDown 
          size={24} 
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <span className="font-semibold">ח.פ:</span>
          <span className="font-mono">{data.companyId}</span>
          <span className="mx-2">•</span>
          <span>{data.companyName}</span>
        </div>
      </div>

      {/* התראה עם פירוט לפי מקור */}
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-2">⚠ נמצאו הליכים משפטיים</h3>
            <p className="text-sm text-red-800 mb-3">
              סה"כ {data.procedures.length} הליכים במאגרי הכונס הרשמי:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {proceduresByType.liquidation > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-300 font-medium">
                  {proceduresByType.liquidation} חברות בפירוק
                </span>
              )}
              {proceduresByType.bankruptcy > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded border border-purple-300 font-medium">
                  {proceduresByType.bankruptcy} חייבים בפירוק
                </span>
              )}
              {proceduresByType.claim > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded border border-amber-300 font-medium">
                  {proceduresByType.claim} תביעות חוב
                </span>
              )}
            </div>
            {data.trustees.length > 0 && (
              <p className="text-sm text-red-800 mt-2">
                נמצאו {data.trustees.length} כונסים/נאמנים רשומים
              </p>
            )}
          </div>
        </div>
      </div>

      {/* רשימת כונסים - רק אם יש */}
      {data.trustees.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">כונסי נכסים ונאמנים</h3>
          {data.trustees.map((trustee: TrusteeInfo, index: number) => (
            <TrusteeInfoCard key={index} trustee={trustee} />
          ))}
        </div>
      )}

      {/* רשימת הליכי פירוק ופשיטת רגל */}
      {(liquidationProcedures.length > 0 || bankruptcyProcedures.length > 0) && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">הליכי פירוק ופשיטת רגל</h3>
          {liquidationProcedures.map((procedure: LegalProcedure, index: number) => (
            <ProcedureCard key={`liq-${index}`} procedure={procedure} />
          ))}
          {bankruptcyProcedures.map((procedure: LegalProcedure, index: number) => (
            <ProcedureCard key={`bank-${index}`} procedure={procedure} />
          ))}
        </div>
      )}

      {/* תביעות חוב - בכרטיס מאוחד */}
      {claimProcedures.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">תביעות חוב</h3>
          <ClaimsCard claims={claimProcedures} />
        </div>
      )}

      {/* חברות קשורות */}
      {data.relatedCompanies && data.relatedCompanies.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">חברות נוספות תחת אותו כונס</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {data.relatedCompanies.map((company: string, index: number) => (
              <li key={index}>{company}</li>
            ))}
          </ul>
        </div>
      )}

      {/* מקור נתונים */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-800 mb-3">מקורות הנתונים</h4>
        <div className="space-y-2 text-xs text-gray-600">
          {proceduresByType.liquidation > 0 && (
            <div className="flex items-start gap-2">
              <DataSourceBadge source="liquidation" />
              <div className="flex-1">
                <p className="font-medium text-gray-700">חברות בפירוק (PR2018)</p>
                <p className="text-gray-500">מכיל חברות שנמצאות בהליך פירוק רשמי. שמות כונסים אינם תמיד זמינים.</p>
              </div>
            </div>
          )}
          {proceduresByType.bankruptcy > 0 && (
            <div className="flex items-start gap-2">
              <DataSourceBadge source="bankruptcy" />
              <div className="flex-1">
                <p className="font-medium text-gray-700">חייבים בהליך פשיטת רגל (PR2018)</p>
                <p className="text-gray-500">מכיל יחידים וחברות בהליכי פשיטת רגל. אין מספר ח.פ - חיפוש לפי מזהה תיק בלבד.</p>
              </div>
            </div>
          )}
          {proceduresByType.claim > 0 && (
            <div className="flex items-start gap-2">
              <DataSourceBadge source="claim" />
              <div className="flex-1">
                <p className="font-medium text-gray-700">תביעות חוב (PR2018)</p>
                <p className="text-gray-500">מכיל תביעות חוב שהוגשו בהליכי פשיטת רגל ופירוק. אין מספר ח.פ - חיפוש לפי מזהה תיק בלבד.</p>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-gray-500 italic">
          כל הנתונים ממאגרי data.gov.il - הכונס הרשמי (מערכת PR2018)
        </p>
      </div>
      </div>
    </div>
  );
};

export default TrusteeCard;
