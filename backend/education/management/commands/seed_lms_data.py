from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from education.models import (
    Category,
    Program,
    AcademicPeriod,
    Subject,
    Course,
    Chapter,
    Material,
    UserProfile,
    Enrollment,
    LoginLog,
)


class Command(BaseCommand):
    help = "Seed LMS data with flexible academic structures, subjects, courses, MCQs, mock tests, and formulas"

    def handle(self, *args, **options):
        self.stdout.write("Seeding BTMath LMS data...")

        # 1. Categories
        cat_plus2, _ = Category.objects.get_or_create(level="plus2", defaults={"name": "+2", "description": "Class 11 and Class 12 Mathematics"})
        cat_bachelor, _ = Category.objects.get_or_create(level="bachelor", defaults={"name": "Bachelor", "description": "BSc, BCA, BSc CSIT, Engineering"})
        cat_master, _ = Category.objects.get_or_create(level="master", defaults={"name": "Master", "description": "MSc and MA Mathematics"})
        cat_ioe, _ = Category.objects.get_or_create(level="ioe", defaults={"name": "IOE", "description": "IOE Entrance & Engineering Mathematics"})

        # 2. Programs with flexible structures
        # +2 Program
        prog_plus2, _ = Program.objects.get_or_create(
            category=cat_plus2,
            name="Higher Secondary Mathematics (+2)",
            defaults={"description": "Comprehensive Mathematics curriculum for Grades 11 and 12.", "duration_info": "2 Years (Grade 11 & 12)"}
        )
        grade11, _ = AcademicPeriod.objects.get_or_create(
            program=prog_plus2,
            name="Grade 11",
            defaults={"period_type": "grade", "order": 1, "description": "NEB Grade 11 Mathematics"}
        )
        grade12, _ = AcademicPeriod.objects.get_or_create(
            program=prog_plus2,
            name="Grade 12",
            defaults={"period_type": "grade", "order": 2, "description": "NEB Grade 12 Mathematics"}
        )

        # BSc CSIT (4 Years / 8 Semesters)
        prog_csit, _ = Program.objects.get_or_create(
            category=cat_bachelor,
            name="BSc CSIT",
            defaults={"description": "Bachelor of Science in Computer Science and Information Technology", "duration_info": "4 Years / 8 Semesters"}
        )
        for i in range(1, 9):
            AcademicPeriod.objects.get_or_create(
                program=prog_csit,
                name=f"Semester {i}",
                defaults={"period_type": "semester", "order": i}
            )

        # BSc (Year + Semester nested structure)
        prog_bsc, _ = Program.objects.get_or_create(
            category=cat_bachelor,
            name="BSc General",
            defaults={"description": "Bachelor of Science with flexible Annual/Semester structure", "duration_info": "4 Years / 8 Semesters"}
        )
        for y in range(1, 5):
            year_period, _ = AcademicPeriod.objects.get_or_create(
                program=prog_bsc,
                name=f"Year {y}",
                parent=None,
                defaults={"period_type": "year", "order": y}
            )
            AcademicPeriod.objects.get_or_create(
                program=prog_bsc,
                name=f"Semester {2 * y - 1}",
                parent=year_period,
                defaults={"period_type": "semester", "order": 1}
            )
            AcademicPeriod.objects.get_or_create(
                program=prog_bsc,
                name=f"Semester {2 * y}",
                parent=year_period,
                defaults={"period_type": "semester", "order": 2}
            )

        # MSc Mathematics
        prog_msc, _ = Program.objects.get_or_create(
            category=cat_master,
            name="MSc Mathematics",
            defaults={"description": "Master of Science in Pure & Applied Mathematics", "duration_info": "2 Years / 4 Semesters"}
        )
        for i in range(1, 5):
            AcademicPeriod.objects.get_or_create(
                program=prog_msc,
                name=f"Semester {i}",
                defaults={"period_type": "semester", "order": i}
            )

        # IOE Entrance
        prog_ioe, _ = Program.objects.get_or_create(
            category=cat_ioe,
            name="IOE Entrance Mathematics",
            defaults={"description": "Dedicated entrance preparation and engineering foundation mathematics", "duration_info": "Entrance Intensive"}
        )

        # 3. Subjects
        sub_calculus, _ = Subject.objects.get_or_create(
            program=prog_csit,
            name="Calculus & Analytical Geometry",
            defaults={"code": "CSC109", "description": "Functions, Limits, Derivatives, and Integrals"}
        )
        sub_neb11, _ = Subject.objects.get_or_create(
            program=prog_plus2,
            academic_period=grade11,
            name="Grade 11 Mathematics",
            defaults={"code": "MAT101", "description": "Algebra, Trigonometry, Calculus, Vectors"}
        )
        sub_neb12, _ = Subject.objects.get_or_create(
            program=prog_plus2,
            academic_period=grade12,
            name="Grade 12 Mathematics",
            defaults={"code": "MAT201", "description": "Advanced Calculus, Differential Equations, Probability"}
        )
        sub_ioe, _ = Subject.objects.get_or_create(
            program=prog_ioe,
            name="Engineering Mathematics & Shortcuts",
            defaults={"code": "IOE-MAT", "description": "Past problems, short tricks, and entrance syllabus"}
        )

        # 4. Courses
        sem1_csit = AcademicPeriod.objects.filter(program=prog_csit, name="Semester 1").first()

        c_csit, _ = Course.objects.get_or_create(
            slug="bsc-csit-calculus-analytics",
            defaults={
                "title": "Calculus and Analytical Geometry (CSIT)",
                "program": prog_csit,
                "academic_period": sem1_csit,
                "subject": sub_calculus,
                "price": Decimal("999.00"),
                "discount_price": Decimal("699.00"),
                "course_type": "paid",
                "instructor": "Er. Vicky & Team",
                "description": "Complete video lessons, typed notes, past question solutions, and unit-wise MCQs for CSIT Semester 1.",
                "is_published": True,
            }
        )

        c_grade12, _ = Course.objects.get_or_create(
            slug="grade-12-mathematics-complete",
            defaults={
                "title": "Grade 12 Complete Mathematics Preparation",
                "program": prog_plus2,
                "academic_period": grade12,
                "subject": sub_neb12,
                "price": Decimal("750.00"),
                "discount_price": Decimal("499.00"),
                "course_type": "paid",
                "instructor": "BTMath Senior Faculty",
                "description": "Board-focused notes, model questions, video lectures, and practice formulas for NEB Grade 12.",
                "is_published": True,
            }
        )

        c_ioe, _ = Course.objects.get_or_create(
            slug="ioe-entrance-mathematics-mastery",
            defaults={
                "title": "IOE Mathematics Entrance Mastery",
                "program": prog_ioe,
                "subject": sub_ioe,
                "price": Decimal("1200.00"),
                "discount_price": Decimal("850.00"),
                "course_type": "paid",
                "instructor": "IOE Toppers & BTMath Mentors",
                "description": "Short tricks, 15+ years solved questions, timed mock tests, and chapter-wise MCQs for IOE entrance.",
                "is_published": True,
            }
        )

        # 5. Chapters & Materials
        for crs, ch_title in [
            (c_csit, "Unit 1: Functions, Limits and Continuity"),
            (c_csit, "Unit 2: Derivatives & Applications"),
            (c_grade12, "Chapter 1: Permutation & Combination"),
            (c_grade12, "Chapter 2: Matrices & Determinants"),
            (c_ioe, "Topic 1: Integration Shortcuts & Definite Integrals"),
            (c_ioe, "Topic 2: Coordinate Geometry & Conic Sections"),
        ]:
            ch, _ = Chapter.objects.get_or_create(course=crs, title=ch_title, defaults={"order": 1})
            # Add free material
            Material.objects.get_or_create(
                course=crs,
                chapter=ch,
                title=f"{ch_title} - Foundation Notes",
                defaults={
                    "material_type": "note",
                    "access_type": "free",
                    "content_text": "### Essential Concepts\n\n- Definition of Limits and Standard Forms\n- L'Hopital's rule shortcuts\n- Key trigonometric expansions: $\\sin x = x - \\frac{x^3}{3!} + \\dots$",
                    "description": "Introductory theory and key definitions."
                }
            )
            # Add preview video
            Material.objects.get_or_create(
                course=crs,
                chapter=ch,
                title=f"{ch_title} - Video Lecture (Sample)",
                defaults={
                    "material_type": "video",
                    "access_type": "preview",
                    "video_url": "https://www.youtube.com/watch?v=SQ4jZ-EAL88",
                    "description": "Video walkthrough with step-by-step shortcuts."
                }
            )
            # Add premium material
            Material.objects.get_or_create(
                course=crs,
                chapter=ch,
                title=f"{ch_title} - Full Premium Solved Past Papers",
                defaults={
                    "material_type": "pdf",
                    "access_type": "premium",
                    "description": "Protected solutions for enrolled students only."
                }
            )

        # 6. Question Bank (Theory / Solved)
        questions_data = [
            {
                "program": prog_csit,
                "subject": sub_calculus,
                "course": c_csit,
                "question_text": "Evaluate the limit: \\lim_{x \\to 0} \\frac{\\tan x - \\sin x}{x^3}.",
                "solution_text": "Using trigonometric identities:\n$$\\tan x - \\sin x = \\sin x \\left(\\frac{1 - \\cos x}{\\cos x}\\right) = \\frac{\\sin x (2\\sin^2(x/2))}{\\cos x}$$\nDividing by $x^3$ and taking limits gives $\\frac{1}{2}$.",
                "marks": 5,
                "difficulty": "medium",
                "year_source": "2080 TU",
                "exam_source": "CSIT Semester 1 Final",
            },
            {
                "program": prog_ioe,
                "subject": sub_ioe,
                "course": c_ioe,
                "question_text": "Find the area bounded by the parabola y^2 = 4ax and its latus rectum.",
                "solution_text": "The latus rectum line is $x = a$. The required area is:\n$$A = 2 \\int_0^a 2\\sqrt{a}\\sqrt{x}\\,dx = 4\\sqrt{a} \\left[ \\frac{2}{3}x^{3/2} \\right]_0^a = \\frac{8}{3}a^2$$",
                "marks": 4,
                "difficulty": "hard",
                "year_source": "2078",
                "exam_source": "IOE Entrance Exam",
            },
            {
                "program": prog_plus2,
                "subject": sub_neb12,
                "course": c_grade12,
                "question_text": "Solve the system of equations using Cramer's Rule: 2x - y = 5, 3x + 2y = 11.",
                "solution_text": "$D = 2(2) - (-1)(3) = 7$.\n$D_x = 5(2) - (-1)(11) = 21 \\implies x = 21/7 = 3$.\n$D_y = 2(11) - 5(3) = 7 \\implies y = 7/7 = 1$.",
                "marks": 4,
                "difficulty": "easy",
                "year_source": "2079",
                "exam_source": "NEB Board Exam",
            },
        ]
        for q in questions_data:
            QuestionBank.objects.get_or_create(question_text=q["question_text"], defaults=q)

        # 7. MCQs
        mcqs_data = [
            {
                "program": prog_ioe,
                "course": c_ioe,
                "topic": "Calculus",
                "question_text": "What is the value of \\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}}\\,dx?",
                "option_a": "\\pi",
                "option_b": "\\pi/2",
                "option_c": "\\pi/4",
                "option_d": "0",
                "correct_option": "C",
                "explanation": "Applying King's property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$, $2I = \\int_0^{\\pi/2} 1\\,dx = \\pi/2 \\implies I = \\pi/4$.",
                "difficulty": "medium",
            },
            {
                "program": prog_ioe,
                "course": c_ioe,
                "topic": "Algebra",
                "question_text": "If A is an invertible square matrix of order 3 and |A| = 4, then |adj(A)| is:",
                "option_a": "4",
                "option_b": "16",
                "option_c": "64",
                "option_d": "1/4",
                "correct_option": "B",
                "explanation": "Formula: $|adj(A)| = |A|^{n-1} = 4^{3-1} = 4^2 = 16$.",
                "difficulty": "easy",
            },
            {
                "program": prog_plus2,
                "course": c_grade12,
                "topic": "Differential Equations",
                "question_text": "The degree of the differential equation \\left(\\frac{d^2y}{dx^2}\\right)^3 + \\left(\\frac{dy}{dx}\\right)^4 + y = 0 is:",
                "option_a": "2",
                "option_b": "3",
                "option_c": "4",
                "option_d": "Not defined",
                "correct_option": "B",
                "explanation": "Degree is the power of the highest order derivative after making it free from radicals. Here highest derivative is d^2y/dx^2 and its power is 3.",
                "difficulty": "easy",
            },
            {
                "program": prog_csit,
                "course": c_csit,
                "topic": "Limits",
                "question_text": "The value of \\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x is:",
                "option_a": "1",
                "option_b": "0",
                "option_c": "e",
                "option_d": "\\infty",
                "correct_option": "C",
                "explanation": "Standard definition of Euler's number e.",
                "difficulty": "easy",
            },
        ]
        created_mcqs = []
        for m in mcqs_data:
            mcq, _ = MCQQuestion.objects.get_or_create(question_text=m["question_text"], defaults=m)
            created_mcqs.append(mcq)

        # 8. Mock Test
        mock_ioe, _ = MockTest.objects.get_or_create(
            slug="ioe-mathematics-model-mock-1",
            defaults={
                "title": "IOE Entrance Mathematics Grand Mock Test #1",
                "description": "Standard 25-question timed mock test simulated according to IOE entrance format with negative marking.",
                "category": cat_ioe,
                "program": prog_ioe,
                "duration_minutes": 25,
                "total_marks": 50,
                "pass_marks": 20,
                "negative_marking_percentage": Decimal("10.00"),
                "is_published": True,
            }
        )
        mock_ioe.questions.set(created_mcqs)

        # 9. Past Questions
        PastQuestion.objects.get_or_create(
            title="IOE Entrance Mathematics Past Paper 2080",
            program=prog_ioe,
            year=2080,
            defaults={
                "exam_type": "IOE Entrance",
                "is_solved": True,
            }
        )
        PastQuestion.objects.get_or_create(
            title="NEB Grade 12 Mathematics Board Exam 2080",
            program=prog_plus2,
            academic_period=grade12,
            year=2080,
            defaults={
                "exam_type": "NEB Final Exam",
                "is_solved": True,
            }
        )

        # 10. Formula Bank
        formulas_data = [
            {
                "category": cat_plus2,
                "program": prog_plus2,
                "topic": "Calculus",
                "title": "Integration by Parts",
                "formula_latex": "\\int u\\,v\\,dx = u \\int v\\,dx - \\int \\left( u' \\int v\\,dx \\right) dx",
                "explanation": "Choose u according to ILATE rule (Inverse, Logarithmic, Algebraic, Trigonometric, Exponential).",
                "example": "$\\int x e^x\\,dx = x e^x - e^x + C$",
            },
            {
                "category": cat_bachelor,
                "program": prog_csit,
                "topic": "Linear Algebra",
                "title": "Eigenvalues & Characteristic Equation",
                "formula_latex": "\\det(A - \\lambda I) = 0",
                "explanation": "Roots of the polynomial $\\lambda_1, \\lambda_2, \\dots$ represent eigenvalues.",
                "example": "For $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$, $\\lambda = 1, 3$.",
            },
            {
                "category": cat_ioe,
                "program": prog_ioe,
                "topic": "Trigonometry",
                "title": "De Moivre's Theorem",
                "formula_latex": "(\\cos \\theta + i\\sin \\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)",
                "explanation": "Applicable for any integer or rational value of n.",
                "example": "$(1+i)^8 = (\\sqrt{2} e^{i\\pi/4})^8 = 16 e^{i 2\\pi} = 16$.",
            }
        ]
        for f in formulas_data:
            Formula.objects.get_or_create(title=f["title"], defaults=f)

        # 11. Profile & Sample Enrollment for User 'bikash'
        user_bikash = User.objects.filter(username="bikash").first()
        if user_bikash:
            UserProfile.objects.get_or_create(
                user=user_bikash,
                defaults={"full_name": "Bikash Kattel", "phone": "9800000000", "role": "student"}
            )
            Enrollment.objects.get_or_create(
                user=user_bikash,
                course=c_csit,
                defaults={"status": "active"}
            )
            LoginLog.objects.get_or_create(user=user_bikash)

        self.stdout.write(self.style.SUCCESS("Successfully seeded BTMath LMS data!"))