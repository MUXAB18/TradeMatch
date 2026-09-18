import { ReactNode } from 'react';
import { ChevronRight, Plus, Pencil } from 'lucide-react';

interface BaseSectionProps {
  title: string;
  onAddOrEdit: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  emptySubtitle: string;
  emptyActionText: string;
  children?: ReactNode;
  isEdit?: boolean;
}

export function BaseProfileSection({
  title,
  onAddOrEdit,
  isEmpty,
  emptyTitle,
  emptySubtitle,
  emptyActionText,
  children,
  isEdit = false,
}: BaseSectionProps) {
  return (
    <section className="bg-white rounded-[24px] border border-[#E8EAF0] p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#1D1D1F] tracking-tight">{title}</h2>
        {!isEmpty && (
          <button
            onClick={onAddOrEdit}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#1D1D1F] transition-colors"
            aria-label={isEdit ? `Edit ${title}` : `Add ${title}`}
          >
            {isEdit ? <ChevronRight size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-[16px] p-6 text-center">
          <h3 className="text-[16px] font-bold text-[#374151] mb-1">{emptyTitle}</h3>
          <p className="text-[14px] text-[#6B7280] mb-4 max-w-[320px] mx-auto">{emptySubtitle}</p>
          <button
            onClick={onAddOrEdit}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#007AFF] hover:opacity-80 transition-opacity"
          >
            {emptyActionText}
            <ChevronRight size={15} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </section>
  );
}

// ----------------------------------------------------------------------
// Specific Sections (For now, they handle UI and empty states)
// ----------------------------------------------------------------------

export function AboutSection({ about, onEdit }: { about: string | null; onEdit: () => void }) {
  return (
    <BaseProfileSection
      title="About"
      onAddOrEdit={onEdit}
      isEmpty={!about}
      isEdit={true}
      emptyTitle="Professional summary"
      emptySubtitle="Tell employers about your background, interests and career goals."
      emptyActionText="Add About"
    >
      <p className="text-[15px] text-[#374151] leading-relaxed whitespace-pre-wrap">{about}</p>
    </BaseProfileSection>
  );
}

export function ExperienceSection({ experience, onAdd, onEditItem }: { experience: any[]; onAdd: () => void; onEditItem?: (index: number) => void }) {
  return (
    <BaseProfileSection
      title="Experience"
      onAddOrEdit={onAdd}
      isEmpty={experience.length === 0}
      emptyTitle="Add your work experience"
      emptySubtitle="Showcase your professional journey to employers."
      emptyActionText="Add experience"
    >
      {experience.map((exp, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFB] flex flex-col items-center justify-center shrink-0 border border-[#E5E7EB]">
            <span className="text-[16px] font-bold text-[#6B7280]">{exp.company?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 pb-6 border-b border-[#F3F4F6] group-last:border-0 group-last:pb-0 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold text-[#1D1D1F] truncate">{exp.title}</h3>
              <p className="text-[15px] font-medium text-[#374151] truncate mt-0.5">{exp.company}</p>
              <p className="text-[14px] text-[#6B7280] mt-0.5">
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate} · {exp.location}
              </p>
              {exp.description && (
                <p className="text-[14px] text-[#374151] mt-3 leading-relaxed">{exp.description}</p>
              )}
            </div>
            {onEditItem && (
              <button 
                onClick={() => onEditItem(i)} 
                className="p-2 -mr-2 text-[#9CA3AF] hover:text-[#007AFF] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </BaseProfileSection>
  );
}

export function SkillsSection({ skills, onEdit }: { skills: string[]; onEdit: () => void }) {
  return (
    <BaseProfileSection
      title="Skills"
      onAddOrEdit={onEdit}
      isEmpty={skills.length === 0}
      isEdit={true}
      emptyTitle="No skills added yet"
      emptySubtitle="Add your skills to improve job matching."
      emptyActionText="Add skills"
    >
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3.5 py-1.5 bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] rounded-full text-[13px] font-semibold hover:bg-[#F1F5F9] transition-colors cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </BaseProfileSection>
  );
}

export function EducationSection({ education, onAdd, onEditItem }: { education: any[]; onAdd: () => void; onEditItem?: (index: number) => void }) {
  return (
    <BaseProfileSection
      title="Education"
      onAddOrEdit={onAdd}
      isEmpty={education.length === 0}
      emptyTitle="Add your education history"
      emptySubtitle="Include your academic background to strengthen your profile."
      emptyActionText="Add education"
    >
      {education.map((edu, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex flex-col items-center justify-center shrink-0 border border-[#E5E7EB]">
            <span className="text-[16px] font-bold text-[#9CA3AF]">{edu.institution?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 pb-6 border-b border-[#F3F4F6] group-last:border-0 group-last:pb-0 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold text-[#1D1D1F] truncate">{edu.institution}</h3>
              <p className="text-[15px] font-medium text-[#374151] truncate mt-0.5">{edu.degree} in {edu.field}</p>
              <p className="text-[14px] text-[#6B7280] mt-0.5">
                {edu.startYear} – {edu.endYear}
              </p>
            </div>
            {onEditItem && (
              <button 
                onClick={() => onEditItem(i)} 
                className="p-2 -mr-2 text-[#9CA3AF] hover:text-[#007AFF] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </BaseProfileSection>
  );
}

export function CertificationsSection({ certifications, onAdd, onEditItem }: { certifications: any[]; onAdd: () => void; onEditItem?: (index: number) => void }) {
  return (
    <BaseProfileSection
      title="Certifications"
      onAddOrEdit={onAdd}
      isEmpty={certifications.length === 0}
      emptyTitle="No certifications added"
      emptySubtitle="Certifications can strengthen your professional profile."
      emptyActionText="Add certification"
    >
      <div className="space-y-6">
        {certifications.map((cert, index) => (
          <div key={index} className="flex gap-4 group">
            <div className="w-12 h-12 rounded-[12px] bg-[#ECFDF5] flex flex-col items-center justify-center shrink-0 border border-[#D1FAE5] overflow-hidden shadow-sm">
              {cert.image ? (
                <img src={cert.image} alt={cert.name || cert} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[16px] font-bold text-[#059669]">C</span>
              )}
            </div>
            <div className="flex-1 pb-6 border-b border-[#F3F4F6] group-last:border-0 group-last:pb-0 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="text-[16px] font-bold text-[#1D1D1F]">
                  {cert.name || cert}
                </h4>
                {cert.issuer && (
                  <div className="text-[15px] text-[#4B5563] mt-0.5">
                    {cert.issuer}
                  </div>
                )}
                {cert.issueDate && (
                  <div className="text-[14px] text-[#6B7280] mt-1.5 font-medium">
                    Issued {cert.issueDate}
                  </div>
                )}
                {cert.description && (
                  <p className="text-[15px] text-[#4B5563] mt-3 leading-relaxed">
                    {cert.description}
                  </p>
                )}
              </div>
              {onEditItem && (
                <button 
                  onClick={() => onEditItem(index)} 
                  className="p-2 -mr-2 text-[#9CA3AF] hover:text-[#007AFF] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseProfileSection>
  );
}

export function ProjectsSection({ projects, onAdd, onEditItem }: { projects: any[]; onAdd: () => void; onEditItem?: (index: number) => void }) {
  return (
    <BaseProfileSection
      title="Projects"
      onAddOrEdit={onAdd}
      isEmpty={projects.length === 0}
      emptyTitle="Showcase your work"
      emptySubtitle="Add projects to help employers understand your capabilities."
      emptyActionText="Add project"
    >
      {projects.map((proj, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex flex-col items-center justify-center shrink-0 border border-[#DBEAFE]">
            <span className="text-[16px] font-bold text-[#2563EB]">{proj.name?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 pb-6 border-b border-[#F3F4F6] group-last:border-0 group-last:pb-0 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold text-[#1D1D1F] truncate">{proj.name}</h3>
              <p className="text-[14px] text-[#6B7280] mt-0.5 truncate">{proj.technologies}</p>
              <p className="text-[14px] text-[#374151] mt-3 leading-relaxed">{proj.description}</p>
            </div>
            {onEditItem && (
              <button 
                onClick={() => onEditItem(i)} 
                className="p-2 -mr-2 text-[#9CA3AF] hover:text-[#007AFF] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </BaseProfileSection>
  );
}

export function ResumeSection({ resume, onUpload, onView, onReplace }: { resume: any; onUpload: () => void; onView?: () => void; onReplace?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <BaseProfileSection
      title="Resume"
      onAddOrEdit={onUpload}
      isEmpty={!resume}
      emptyTitle="Upload your resume"
      emptySubtitle="Stand out to employers by adding your most up-to-date resume."
      emptyActionText="Upload resume"
    >
      {resume && (
        <div className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-2xl bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-red-100 flex items-center justify-center text-red-600 font-bold text-[12px]">
              PDF
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1D1D1F]">{resume.name}</p>
              <p className="text-[13px] text-[#6B7280]">Updated {resume.updatedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onView}
              className="px-3 py-1.5 text-[13px] font-bold text-[#007AFF] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              View
            </button>
            <label className="cursor-pointer px-3 py-1.5 text-[13px] font-bold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
              Replace
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onReplace} />
            </label>
          </div>
        </div>
      )}
    </BaseProfileSection>
  );
}
