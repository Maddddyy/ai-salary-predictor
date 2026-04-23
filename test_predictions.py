"""
Comprehensive testing of salary prediction API
Tests 10 different scenarios
"""

import requests
import json
from typing import Dict, List

API_URL = "http://localhost:8000/api/predict"

# 10 Test scenarios covering different profiles
test_cases = [
    {
        "name": "Junior Frontend Developer - Startup",
        "input": {
            "job_title": "Frontend Developer",
            "experience_years": 2,
            "education_level": "Bachelor",
            "skills_count": 6,
            "industry": "Technology",
            "company_size": "Startup",
            "location": "Remote",
            "remote_work": "Yes",
            "certifications": 1
        }
    },
    {
        "name": "Senior AI Engineer - Tech Giant",
        "input": {
            "job_title": "AI Engineer",
            "experience_years": 10,
            "education_level": "PhD",
            "skills_count": 18,
            "industry": "Technology",
            "company_size": "Enterprise",
            "location": "USA",
            "remote_work": "Hybrid",
            "certifications": 5
        }
    },
    {
        "name": "Mid-level Data Scientist - Finance",
        "input": {
            "job_title": "Data Scientist",
            "experience_years": 5,
            "education_level": "Master",
            "skills_count": 12,
            "industry": "Finance",
            "company_size": "Large",
            "location": "UK",
            "remote_work": "No",
            "certifications": 3
        }
    },
    {
        "name": "Entry-level Business Analyst - Healthcare",
        "input": {
            "job_title": "Business Analyst",
            "experience_years": 1,
            "education_level": "Bachelor",
            "skills_count": 5,
            "industry": "Healthcare",
            "company_size": "Medium",
            "location": "Canada",
            "remote_work": "Hybrid",
            "certifications": 0
        }
    },
    {
        "name": "Senior DevOps Engineer - Enterprise",
        "input": {
            "job_title": "DevOps Engineer",
            "experience_years": 8,
            "education_level": "Master",
            "skills_count": 15,
            "industry": "Technology",
            "company_size": "Enterprise",
            "location": "Germany",
            "remote_work": "No",
            "certifications": 4
        }
    },
    {
        "name": "Principal ML Engineer - Tech",
        "input": {
            "job_title": "Machine Learning Engineer",
            "experience_years": 12,
            "education_level": "PhD",
            "skills_count": 20,
            "industry": "Technology",
            "company_size": "Enterprise",
            "location": "USA",
            "remote_work": "Hybrid",
            "certifications": 6
        }
    },
    {
        "name": "Junior Data Analyst - Retail",
        "input": {
            "job_title": "Data Analyst",
            "experience_years": 1,
            "education_level": "Bachelor",
            "skills_count": 4,
            "industry": "Retail",
            "company_size": "Small",
            "location": "India",
            "remote_work": "No",
            "certifications": 1
        }
    },
    {
        "name": "Senior Product Manager - Finance",
        "input": {
            "job_title": "Product Manager",
            "experience_years": 9,
            "education_level": "Master",
            "skills_count": 14,
            "industry": "Finance",
            "company_size": "Enterprise",
            "location": "Singapore",
            "remote_work": "Hybrid",
            "certifications": 3
        }
    },
    {
        "name": "Mid-level Backend Dev - Startup Remote",
        "input": {
            "job_title": "Backend Developer",
            "experience_years": 4,
            "education_level": "Bachelor",
            "skills_count": 10,
            "industry": "Technology",
            "company_size": "Startup",
            "location": "Remote",
            "remote_work": "Yes",
            "certifications": 2
        }
    },
    {
        "name": "Entry-level Cybersecurity - Government",
        "input": {
            "job_title": "Cybersecurity Analyst",
            "experience_years": 1,
            "education_level": "Bachelor",
            "skills_count": 6,
            "industry": "Government",
            "company_size": "Large",
            "location": "USA",
            "remote_work": "No",
            "certifications": 2
        }
    }
]

def test_prediction(test_case: Dict) -> Dict:
    """Test a single prediction scenario"""
    print(f"\n{'='*80}")
    print(f"Testing: {test_case['name']}")
    print(f"{'='*80}")
    
    try:
        response = requests.post(API_URL, json=test_case['input'])
        response.raise_for_status()
        
        result = response.json()
        
        print(f"✅ Prediction successful!")
        print(f"   Predicted Salary: {result['predicted_salary_formatted']}")
        print(f"   Confidence Range: ${result['confidence_interval_lower']:,.0f} - ${result['confidence_interval_upper']:,.0f}")
        print(f"   Model Confidence: {result['model_confidence']:.1f}%")
        print(f"   Top 3 Factors:")
        
        for i, fc in enumerate(result['feature_contributions'][:3], 1):
            impact = "+" if fc['shap_value'] > 0 else ""
            print(f"      {i}. {fc['feature']}: {impact}${fc['shap_value']:,.0f}")
        
        return {
            "test_name": test_case['name'],
            "status": "PASS",
            "salary": result['predicted_salary'],
            "confidence": result['model_confidence']
        }
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Test failed: {str(e)}")
        return {
            "test_name": test_case['name'],
            "status": "FAIL",
            "error": str(e)
        }

def main():
    print("="*80)
    print("SALARY PREDICTION API - COMPREHENSIVE TESTING")
    print("="*80)
    print(f"Testing {len(test_cases)} scenarios...")
    
    results = []
    for test_case in test_cases:
        result = test_prediction(test_case)
        results.append(result)
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in results if r['status'] == 'PASS')
    failed = sum(1 for r in results if r['status'] == 'FAIL')
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/len(results)*100):.1f}%")
    
    if passed == len(results):
        print("\n🎉 ALL TESTS PASSED! 🎉")
    
    # Salary range summary
    salaries = [r['salary'] for r in results if r['status'] == 'PASS']
    if salaries:
        print(f"\nSalary Range Tested:")
        print(f"   Minimum: ${min(salaries):,.0f}")
        print(f"   Maximum: ${max(salaries):,.0f}")
        print(f"   Average: ${sum(salaries)/len(salaries):,.0f}")
    
    # Save results
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: test_results.json")
    print("="*80)

if __name__ == "__main__":
    main()
