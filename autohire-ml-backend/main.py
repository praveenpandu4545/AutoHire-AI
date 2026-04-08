from fastapi import FastAPI
from routers.eligibility import router as eligibility_router
from routers.ats import router as ats_router   
from routers.review import router as review_router

app = FastAPI()

# Register routers
app.include_router(eligibility_router)
app.include_router(ats_router)   
app.include_router(review_router)

@app.get("/")
def root():
    return {"message": "AutoHire ML Service Running 🚀"}