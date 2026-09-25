import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';

export interface JobFilters {
  type: string | null;
  experience: string | null;
  salary: string;
}

interface JobFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: JobFilters) => void;
  initialFilters?: JobFilters;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
const EXPERIENCE = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
const SALARY_RANGES = ['Any', '< $50k', '$50k - $100k', '> $100k'];

export default function JobFilterModal({ visible, onClose, onApply, initialFilters }: JobFilterModalProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const [selectedType, setSelectedType] = useState<string | null>(initialFilters?.type || null);
  const [selectedExp, setSelectedExp] = useState<string | null>(initialFilters?.experience || null);
  const [selectedSalary, setSelectedSalary] = useState<string>(initialFilters?.salary || 'Any');

  const FilterSection = ({ title, options, selected, onSelect }: any) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.chipContainer}>
        {options.map((opt: string) => {
          const isActive = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : (isDark ? '#1E2122' : '#F5F6F8'),
                  borderColor: isActive ? colors.primary : (isDark ? '#2A2D2E' : '#E5E6E8'),
                }
              ]}
              onPress={() => onSelect(isActive ? null : opt)}
            >
              <Text style={[
                styles.chipText,
                { color: isActive ? '#fff' : colors.textSecondary }
              ]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayPress} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: isDark ? '#3A3D3E' : '#E5E6E8' }]} />
          </View>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Filter Jobs</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <FilterSection 
              title="Job Type" 
              options={JOB_TYPES} 
              selected={selectedType} 
              onSelect={setSelectedType} 
            />
            
            <FilterSection 
              title="Experience Level" 
              options={EXPERIENCE} 
              selected={selectedExp} 
              onSelect={setSelectedExp} 
            />
            
            <FilterSection 
              title="Salary Range" 
              options={SALARY_RANGES} 
              selected={selectedSalary} 
              onSelect={(val: string) => setSelectedSalary(val || 'Any')} 
            />
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.resetBtn, { backgroundColor: colors.surface }]}
              onPress={() => {
                setSelectedType(null);
                setSelectedExp(null);
                setSelectedSalary('Any');
              }}
            >
              <Text style={[styles.resetText, { color: colors.textPrimary }]}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                onApply({ type: selectedType, experience: selectedExp, salary: selectedSalary });
                onClose();
              }}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayPress: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  resetBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
